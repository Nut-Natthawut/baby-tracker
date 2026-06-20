export type SignupValidationResult =
  | { valid: true; value: string }
  | { valid: false; message: string };

const NAME_PATTERN = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
const PRINTABLE_ASCII_PATTERN = /^[!-~]+$/;
const ENGLISH_LETTER_PATTERN = /[A-Za-z]/;

function characterCount(value: string) {
  return Array.from(value).length;
}

export function validateSignupName(name: string): SignupValidationResult {
  const normalizedName = name.trim();
  const length = characterCount(normalizedName);

  if (length === 0) {
    return { valid: false, message: "กรุณากรอกชื่อ" };
  }
  if (length < 2) {
    return {
      valid: false,
      message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
    };
  }
  if (length > 50) {
    return {
      valid: false,
      message: "ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร",
    };
  }
  if (!NAME_PATTERN.test(normalizedName)) {
    return { valid: false, message: "ชื่อมีรูปแบบไม่ถูกต้อง" };
  }

  return { valid: true, value: normalizedName };
}

export function validateSignupPassword(
  password: string
): SignupValidationResult {
  const length = characterCount(password);

  if (length < 8) {
    return {
      valid: false,
      message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    };
  }
  if (length > 64) {
    return {
      valid: false,
      message: "รหัสผ่านต้องไม่ยาวเกิน 64 ตัวอักษร",
    };
  }
  if (
    !PRINTABLE_ASCII_PATTERN.test(password) ||
    !ENGLISH_LETTER_PATTERN.test(password)
  ) {
    return {
      valid: false,
      message: "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก",
    };
  }

  return { valid: true, value: password };
}
