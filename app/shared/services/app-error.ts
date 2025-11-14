export type AppErrorCode =
  | "phone_already_exists"
  | "email_already_exists"
  | "invalid_password"
  | "password_history"
  | "password_dictionary"
  | "password_personal"
  | "password_too_short"
  | "rate_limit"
  | "resource_already_exists"
  | "file_size_exceeded"
  | "file_type_not_allowed"
  | "unknown_error";

export interface AppErrorInfo {
  code: AppErrorCode;
  message: string;
}

export function parseAppError(err: unknown): AppErrorInfo {
  const raw = (err as Error)?.message ?? String(err ?? "");
  const lower = raw.toLowerCase();
  const json = (() => {
    try {
      return JSON.stringify(err ?? {});
    } catch {
      return "";
    }
  })();

  if (
    (lower.includes("phone number") && lower.includes("already exists")) ||
    (lower.includes("phone") &&
      lower.includes("already") &&
      !lower.includes("email"))
  ) {
    return {
      code: "phone_already_exists",
      message: "Этот номер уже зарегистрирован",
    };
  }

  if (
    lower.includes("a user with the same id") &&
    lower.includes("email") &&
    lower.includes("phone")
  ) {
    return {
      code: "email_already_exists",
      message: "Этот email уже используется",
    };
  }

  if (
    lower.includes("a target with the same id already exists") ||
    lower.includes("target with the same id")
  ) {
    return {
      code: "email_already_exists",
      message: "Этот email уже используется",
    };
  }

  if (
    json.toLowerCase().includes("phone_already_exists") ||
    lower.includes("phone_already_exists")
  ) {
    return {
      code: "phone_already_exists",
      message: "Этот номер уже зарегистрирован",
    };
  }

  if (
    (lower.includes("user") && lower.includes("already")) ||
    (lower.includes("email") && lower.includes("already")) ||
    json.toLowerCase().includes("user_already_exists") ||
    json.toLowerCase().includes("email_already_exists") ||
    lower.includes("user_already_exists") ||
    lower.includes("email_already_exists")
  ) {
    return {
      code: "email_already_exists",
      message: "Этот email уже используется",
    };
  }

  if (
    (lower.includes("invalid") && lower.includes("password")) ||
    (lower.includes("incorrect") && lower.includes("password")) ||
    lower.includes("please check the email and password") ||
    lower.includes("please check the email and")
  ) {
    return { code: "invalid_password", message: "Неверный email или пароль" };
  }

  if (
    lower.includes("similar to your previous") ||
    (lower.includes("similar") && lower.includes("previous password"))
  ) {
    return {
      code: "password_history",
      message:
        "Пароль похож на предыдущий. В целях безопасности выберите другой пароль",
    };
  }

  if (lower.includes("password_history") || lower.includes("history")) {
    return {
      code: "password_history",
      message: "Нельзя использовать один из ваших недавних паролей",
    };
  }

  if (
    lower.includes("password_dictionary") ||
    lower.includes("dictionary") ||
    lower.includes("common")
  ) {
    return {
      code: "password_dictionary",
      message: "Пароль слишком простой или часто используемый",
    };
  }
  if (lower.includes("personal") || lower.includes("contains")) {
    return {
      code: "password_personal",
      message: "Пароль не должен содержать ваше имя, email или телефон",
    };
  }
  if (
    lower.includes("short") ||
    lower.includes("weak") ||
    lower.includes("length")
  ) {
    return {
      code: "password_too_short",
      message: "Пароль должен содержать минимум 8 символов",
    };
  }

  if (
    lower.includes("file_size_exceeded") ||
    json.toLowerCase().includes("file_size_exceeded")
  ) {
    return {
      code: "file_size_exceeded",
      message: "Файл слишком большой (максимум 5 МБ)",
    };
  }
  if (
    lower.includes("file_type_not_allowed") ||
    json.toLowerCase().includes("file_type_not_allowed")
  ) {
    return {
      code: "file_type_not_allowed",
      message: "Неподдерживаемый формат файла",
    };
  }
  if (lower.includes("already exists") || lower.includes("already_exists")) {
    return {
      code: "resource_already_exists",
      message: "Запись уже существует",
    };
  }

  return { code: "unknown_error", message: raw || "Неизвестная ошибка" };
}
