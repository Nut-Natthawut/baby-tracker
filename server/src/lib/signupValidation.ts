type SignupInput = {
  name: unknown;
  email: unknown;
  password: unknown;
};

type ValidationResult =
  | {
      valid: true;
      value: { name: string; email: string; password: string };
    }
  | { valid: false; message: string };

const NAME_PATTERN = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
const PRINTABLE_ASCII_PATTERN = /^[!-~]+$/;
const ENGLISH_LETTER_PATTERN = /[A-Za-z]/;

function characterCount(value: string) {
  return Array.from(value).length;
}

export function validateSignupInput(input: SignupInput): ValidationResult {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  const nameLength = characterCount(name);
  const passwordLength = characterCount(password);

  if (nameLength === 0) {
    return { valid: false, message: "กรุณากรอกชื่อ" };
  }
  if (nameLength < 2) {
    return {
      valid: false,
      message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
    };
  }
  if (nameLength > 50) {
    return {
      valid: false,
      message: "ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร",
    };
  }
  if (!NAME_PATTERN.test(name)) {
    return { valid: false, message: "ชื่อมีรูปแบบไม่ถูกต้อง" };
  }
  if (!email) {
    return { valid: false, message: "Email is required" };
  }
  if (passwordLength < 8) {
    return {
      valid: false,
      message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
    };
  }
  if (passwordLength > 64) {
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

  return { valid: true, value: { name, email, password } };
}
