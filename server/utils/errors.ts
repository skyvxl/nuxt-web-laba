interface SafeErrorOptions {
  statusCode?: number;
  publicMessage?: string;
  logDetails?: boolean;
}

export function handleServerError(
  error: unknown,
  context: string,
  options: SafeErrorOptions = {}
) {
  const {
    statusCode = 500,
    publicMessage = "Произошла ошибка на сервере",
    logDetails = true,
  } = options;

  // Log detailed error on server (not sent to client)
  if (logDetails) {
    console.error(`[${context}] Error:`, error);
    if (error instanceof Error) {
      console.error(`[${context}] Stack:`, error.stack);
    }
  }

  // Return generic error to client
  throw createError({
    statusCode,
    statusMessage: publicMessage,
  });
}

export function sanitizeErrorMessage(error: unknown): string {
  if (!error) return "Неизвестная ошибка";

  // Known H3 errors can be passed through
  if (
    typeof error === "object" &&
    "statusCode" in error &&
    "statusMessage" in error
  ) {
    return String((error as { statusMessage: unknown }).statusMessage);
  }

  // For other errors, return generic message
  if (error instanceof Error) {
    // Check for known safe error patterns
    const message = error.message.toLowerCase();
    if (message.includes("not found")) return "Данные не найдены";
    if (message.includes("unauthorized")) return "Требуется авторизация";
    if (message.includes("forbidden")) return "Доступ запрещён";
    if (message.includes("invalid")) return "Некорректные данные";
  }

  return "Произошла ошибка";
}

/**
 * Validate and sanitize user input
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): string {
  const { minLength = 0, maxLength = Infinity, required = true } = options;

  if (value === null || value === undefined || value === "") {
    if (required) {
      throw createError({
        statusCode: 400,
        statusMessage: `Поле "${fieldName}" обязательно`,
      });
    }
    return "";
  }

  const str = String(value).trim();

  if (required && str.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" не может быть пустым`,
    });
  }

  if (str.length < minLength) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" должно содержать минимум ${minLength} символов`,
    });
  }

  if (str.length > maxLength) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" не может превышать ${maxLength} символов`,
    });
  }

  return str;
}

/**
 * Validate number input
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean } = {}
): number | null {
  const { min = -Infinity, max = Infinity, required = true } = options;

  if (value === null || value === undefined || value === "") {
    if (required) {
      throw createError({
        statusCode: 400,
        statusMessage: `Поле "${fieldName}" обязательно`,
      });
    }
    return null;
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" должно быть числом`,
    });
  }

  if (num < min) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" должно быть не меньше ${min}`,
    });
  }

  if (num > max) {
    throw createError({
      statusCode: 400,
      statusMessage: `Поле "${fieldName}" должно быть не больше ${max}`,
    });
  }

  return num;
}
