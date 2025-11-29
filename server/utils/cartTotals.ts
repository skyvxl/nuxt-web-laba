import { Query } from "node-appwrite";
import type { Databases } from "node-appwrite";

interface CartTotalsConfig {
  databaseId: string;
  cartsCollectionId: string;
  cartItemsCollectionId: string;
}

interface CartItem {
  quantity: number;
  fixedPrice: number;
}

/**
 * Maximum number of retry attempts for optimistic locking.
 * If a concurrent update is detected, the function will retry
 * fetching items and recalculating totals.
 */
const MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds.
 * Uses exponential backoff: retry N will wait BASE_RETRY_DELAY * 2^N ms.
 */
const BASE_RETRY_DELAY = 50;

/**
 * Checks if an error is a transient error that should be retried.
 * Only network errors and Appwrite 409 conflict errors are considered transient.
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network-related errors
  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    name.includes("fetch")
  ) {
    return true;
  }

  // Appwrite conflict errors (HTTP 409)
  if (message.includes("409") || message.includes("conflict")) {
    return true;
  }

  return false;
}

/**
 * Parses a numeric value safely, returning 0 for invalid values.
 */
function parseNumericValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Fetches all cart items for a given cart, handling pagination.
 */
async function fetchAllCartItems(
  databases: Databases,
  config: CartTotalsConfig,
  cartId: string
): Promise<CartItem[]> {
  const items: CartItem[] = [];
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const response = await databases.listDocuments(
      config.databaseId,
      config.cartItemsCollectionId,
      [
        Query.equal("cartId", cartId),
        Query.limit(batchSize),
        Query.offset(offset),
      ]
    );

    const docs = response.documents || [];
    for (const doc of docs) {
      const itemDoc = doc as unknown as Record<string, unknown>;
      items.push({
        quantity: parseNumericValue(itemDoc.quantity),
        fixedPrice: parseNumericValue(itemDoc.fixedPrice),
      });
    }

    if (docs.length < batchSize) break;
    offset += batchSize;
  }

  return items;
}

/**
 * Calculates cart totals from items.
 */
function calculateTotals(items: CartItem[]): {
  totalItems: number;
  totalPrice: number;
} {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.fixedPrice,
    0
  );
  return { totalItems, totalPrice };
}

/**
 * Gets the current cart document with its updatedAt timestamp.
 */
async function getCartVersion(
  databases: Databases,
  config: CartTotalsConfig,
  cartId: string
): Promise<string> {
  const cart = await databases.getDocument(
    config.databaseId,
    config.cartsCollectionId,
    cartId
  );
  const cartDoc = cart as unknown as Record<string, unknown>;
  return String(cartDoc.updatedAt ?? "");
}

/**
 * Recalculates and updates cart totals with optimistic locking.
 *
 * This function implements a retry mechanism to handle race conditions:
 * 1. Fetch the current cart version (updatedAt timestamp)
 * 2. Fetch all cart items and calculate totals
 * 3. Check if version changed during calculation (detect concurrent modification)
 * 4. Attempt to update the cart
 * 5. If version changed or transient error occurred, retry with exponential backoff
 *
 * The updatedAt field serves as a version check - if it changed between
 * reading items and updating, we know another request modified the cart.
 *
 * Note: Appwrite does not support conditional updates or database transactions,
 * so there's still a small window between the version check and the update
 * where a race could occur. This is the best achievable without transaction support.
 * The version check significantly reduces (but cannot eliminate) the race window.
 *
 * @throws Error if max retries exceeded or non-transient database errors occur
 */
export async function recalculateCartTotalsWithRetry(
  databases: Databases,
  config: CartTotalsConfig,
  cartId: string
): Promise<{ totalItems: number; totalPrice: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Get current cart version before fetching items
      const versionBefore = await getCartVersion(databases, config, cartId);

      // Fetch all items and calculate totals
      const items = await fetchAllCartItems(databases, config, cartId);
      const { totalItems, totalPrice } = calculateTotals(items);

      // Check if cart was modified while we were calculating
      const versionAfter = await getCartVersion(databases, config, cartId);

      if (versionBefore !== versionAfter) {
        // Cart was modified by another request, retry
        if (attempt < MAX_RETRIES - 1) {
          const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Max retries reached due to concurrent modifications
        throw new Error(
          "Cart was modified by concurrent requests, max retries exceeded"
        );
      }

      // Update cart totals
      // Note: There's a small race window between the version check above and this update.
      // This is unavoidable without Appwrite transaction/conditional update support.
      const timestampNow = new Date().toISOString();
      await databases.updateDocument(
        config.databaseId,
        config.cartsCollectionId,
        cartId,
        { totalItems, totalPrice, updatedAt: timestampNow }
      );

      return { totalItems, totalPrice };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on transient errors (network issues, conflicts)
      if (isRetryableError(error) && attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-transient error or max retries reached, throw immediately
      throw lastError;
    }
  }

  throw (
    lastError ??
    new Error("Failed to recalculate cart totals after max retries")
  );
}

/**
 * Updates cart item quantity with optimistic locking and retry mechanism.
 *
 * This function handles race conditions when multiple requests try to update
 * the same cart item simultaneously:
 * 1. Compare the current item's updatedAt with the expected version
 * 2. If they match, perform the update
 * 3. If they don't match (concurrent modification), re-fetch and retry
 *
 * @param databases - Appwrite databases instance
 * @param databaseId - Database ID
 * @param collectionId - Cart items collection ID
 * @param itemId - The cart item document ID
 * @param currentQuantity - The current quantity (used to calculate new value)
 * @param addQuantity - Quantity to add to current
 * @param expectedVersion - The expected updatedAt value for optimistic locking
 * @returns The updated document
 * @throws Error if max retries exceeded or non-transient errors occur
 */
export async function updateCartItemQuantityWithRetry(
  databases: Databases,
  databaseId: string,
  collectionId: string,
  itemId: string,
  currentQuantity: number,
  addQuantity: number,
  expectedVersion: unknown
): Promise<Record<string, unknown>> {
  let lastError: Error | null = null;
  let latestQuantity = currentQuantity;
  let latestVersion = expectedVersion;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // On retry, re-fetch the current state
      if (attempt > 0) {
        const currentItem = await databases.getDocument(
          databaseId,
          collectionId,
          itemId
        );
        const itemDoc = currentItem as unknown as Record<string, unknown>;
        latestQuantity = parseNumericValue(itemDoc.quantity);
        latestVersion = itemDoc.updatedAt;
      }

      // Calculate new quantity
      const newQuantity = latestQuantity + addQuantity;
      const timestampNow = new Date().toISOString();

      // Check version before update (optimistic locking)
      const currentItem = await databases.getDocument(
        databaseId,
        collectionId,
        itemId
      );
      const itemDoc = currentItem as unknown as Record<string, unknown>;

      if (String(itemDoc.updatedAt ?? "") !== String(latestVersion ?? "")) {
        // Item was modified by another request
        if (attempt < MAX_RETRIES - 1) {
          const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(
          "Cart item was modified by concurrent requests, max retries exceeded"
        );
      }

      // Perform the update
      const updated = await databases.updateDocument(
        databaseId,
        collectionId,
        itemId,
        {
          quantity: newQuantity,
          updatedAt: timestampNow,
        }
      );

      return updated as unknown as Record<string, unknown>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on transient errors
      if (isRetryableError(error) && attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw (
    lastError ??
    new Error("Failed to update cart item quantity after max retries")
  );
}
