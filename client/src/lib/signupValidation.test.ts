import { describe, expect, it } from "vitest";
import {
  validateSignupEmail,
  validateSignupName,
  validateSignupPassword,
} from "./signupValidation";

describe("validateSignupEmail", () => {
  it.each(["", " ", "test", "test.com", "test@gmail", "test@localhost", "test@com", "test@.com"])(
    "rejects an invalid email format: %j",
    (email) => {
      expect(validateSignupEmail(email)).toEqual({
        valid: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง",
      });
    }
  );

  it.each(["test@gmail.com", " Test.User+demo@GMAIL.COM "])(
    "accepts and normalizes a valid email: %j",
    (email) => {
      expect(validateSignupEmail(email).valid).toBe(true);
    }
  );

  it("normalizes email casing and surrounding whitespace", () => {
    expect(validateSignupEmail(" Test.User+demo@GMAIL.COM ")).toEqual({
      valid: true,
      value: "test.user+demo@gmail.com",
    });
  });
});

describe("validateSignupName", () => {
  it.each(["", " ", "     ", "\t", "\n"])(
    "rejects a missing name: %j",
    (name) => {
      expect(validateSignupName(name)).toEqual({
        valid: false,
        message: "กรุณากรอกชื่อ",
      });
    }
  );

  it("rejects a one-character name", () => {
    expect(validateSignupName("ก")).toEqual({
      valid: false,
      message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
    });
  });

  it("accepts the two-character lower boundary", () => {
    expect(validateSignupName("ณัฐ")).toEqual({
      valid: true,
      value: "ณัฐ",
    });
  });

  it.each(["สมชาย ใจดี", "John Doe", "  สมชาย ใจดี  "])(
    "accepts and trims a valid name: %j",
    (name) => {
      expect(validateSignupName(name).valid).toBe(true);
    }
  );

  it.each(["John123", "สมชาย!", "John_Doe", "John  Doe", "John\tDoe"])(
    "rejects an invalid name format: %j",
    (name) => {
      expect(validateSignupName(name)).toEqual({
        valid: false,
        message: "ชื่อมีรูปแบบไม่ถูกต้อง",
      });
    }
  );

  it("accepts a 50-character name", () => {
    const name = "A".repeat(50);
    expect(validateSignupName(name)).toEqual({ valid: true, value: name });
  });

  it("rejects a 51-character name", () => {
    expect(validateSignupName("A".repeat(51))).toEqual({
      valid: false,
      message: "ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร",
    });
  });
});

describe("validateSignupPassword", () => {
  it.each(["", "A1!", "Abc1234"])(
    "rejects a password shorter than 8 characters: %j",
    (password) => {
      expect(validateSignupPassword(password)).toEqual({
        valid: false,
        message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร",
      });
    }
  );

  it("accepts the 8-character lower boundary", () => {
    expect(validateSignupPassword("Abcd1234")).toEqual({
      valid: true,
      value: "Abcd1234",
    });
  });

  it("accepts the 64-character upper boundary", () => {
    const password = `A${"1".repeat(63)}`;
    expect(validateSignupPassword(password)).toEqual({
      valid: true,
      value: password,
    });
  });

  it("rejects a password longer than 64 characters", () => {
    expect(validateSignupPassword(`A${"1".repeat(64)}`)).toEqual({
      valid: false,
      message: "รหัสผ่านต้องไม่ยาวเกิน 64 ตัวอักษร",
    });
  });

  it.each(["รหัสผ่าน123", "passwordไทย", "12345678", "!!!!!!!!"])(
    "rejects a password that is not based on English letters: %j",
    (password) => {
      expect(validateSignupPassword(password)).toEqual({
        valid: false,
        message: "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก",
      });
    }
  );
});
