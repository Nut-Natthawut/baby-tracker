import { describe, expect, it } from "vitest";
import { validateSignupInput } from "./signupValidation";

const validInput = {
  name: "สมชาย ใจดี",
  email: "test@example.com",
  password: "Abcd1234",
};

describe("validateSignupInput", () => {
  it.each(["", " ", "test", "test.com", "test@gmail", "test@localhost", "test@com", "test@.com"])(
    "rejects invalid email %j",
    (email) => {
      expect(validateSignupInput({ ...validInput, email })).toEqual({
        valid: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง",
      });
    }
  );

  it.each([
    [" ", "กรุณากรอกชื่อ"],
    ["ก", "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"],
    ["A".repeat(51), "ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร"],
    ["John!", "ชื่อมีรูปแบบไม่ถูกต้อง"],
  ])("rejects invalid name %j", (name, message) => {
    expect(validateSignupInput({ ...validInput, name })).toEqual({
      valid: false,
      message,
    });
  });

  it.each([
    ["Abc1234", "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"],
    [
      `A${"1".repeat(64)}`,
      "รหัสผ่านต้องไม่ยาวเกิน 64 ตัวอักษร",
    ],
    [
      "รหัสผ่าน123",
      "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก",
    ],
    ["12345678", "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก"],
  ])("rejects invalid password %j", (password, message) => {
    expect(validateSignupInput({ ...validInput, password })).toEqual({
      valid: false,
      message,
    });
  });

  it("returns normalized signup data for a valid request", () => {
    expect(
      validateSignupInput({
        name: "  สมชาย ใจดี  ",
        email: " Test@Example.COM ",
        password: "Abcd1234",
      })
    ).toEqual({
      valid: true,
      value: {
        name: "สมชาย ใจดี",
        email: "test@example.com",
        password: "Abcd1234",
      },
    });
  });
});
