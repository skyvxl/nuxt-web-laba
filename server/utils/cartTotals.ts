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
 * Fetches all cart items for a given cart, handling pagination.
 */
async function fetchAllCartItems(
  databases: Databases,
  config: CartTotalsConfig,
  cartId: string
): Promise<CartItem[]> {
  const items: CartItem[] = [];
  let offset = 0;
  const batchSize = 1000;

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
        quantity: Number(itemDoc.quantity ?? 0),
        fixedPrice: Number(itemDoc.fixedPrice ?? 0),
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
 * 3. Attempt to update the cart
 * 4. If another request modified the cart between steps 1-3, retry
 * 
 * The updatedAt field serves as a version check - if it changed between
 * reading items and updating, we know another request modified the cart.
 * 
 * @throws Error if max retries exceeded or other database errors occur
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
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Update cart totals
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
      
      // If it's a conflict/version mismatch error from Appwrite, retry
      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Failed to recalculate cart totals after max retries");
}
