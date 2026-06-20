# Register Name and Password Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent account creation when the Register form contains an invalid name or password, and show a precise Thai validation message for every rejected case.

**Architecture:** Add small pure validation modules on both sides of the trust boundary: the React client validates before calling `signup`, while the Hono API validates the raw request before querying the database or hashing a password. Each module returns the same stable validation result shape, and unit tests lock down whitespace, length, character-set, and boundary behavior.

**Tech Stack:** React 18, TypeScript, Vite, Hono, Cloudflare Workers, Vitest, npm

---

## Validation Contract

Validation runs in this order so that each input produces one predictable message.

| Field | Rejected input | Thai message |
|---|---|---|
| Name | Empty or whitespace only | `กรุณากรอกชื่อ` |
| Name | Fewer than 2 Unicode characters after trimming | `ชื่อต้องมีอย่างน้อย 2 ตัวอักษร` |
| Name | More than 50 Unicode characters after trimming | `ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร` |
| Name | Contains digits, punctuation, symbols, tabs, newlines, or repeated internal spaces | `ชื่อมีรูปแบบไม่ถูกต้อง` |
| Password | Empty or fewer than 8 characters | `รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร` |
| Password | More than 64 characters | `รหัสผ่านต้องไม่ยาวเกิน 64 ตัวอักษร` |
| Password | Contains non-ASCII characters, including Thai, or contains no English letter | `รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก` |

Accepted names contain Unicode letters and combining marks, allowing Thai and English names. A single normal space may separate name parts. Leading and trailing spaces are removed before validation and storage.

Accepted passwords contain printable ASCII characters from code point 33 (`!`) through 126 (`~`), contain at least one English letter, and are not trimmed because spaces and exact password bytes must never be silently changed.

## File Structure

- Create `client/src/lib/signupValidation.ts`: pure client-side name/password validation and Thai messages.
- Create `client/src/lib/signupValidation.test.ts`: unit tests for all client-side validation boundaries.
- Modify `client/src/pages/Signup.tsx`: validate before submission, display the returned message, and mark fields with useful HTML constraints.
- Modify `client/src/context/AuthContext.tsx`: make `name` required in the signup function contract and preserve API validation messages.
- Modify `client/package.json` and `client/package-lock.json`: add Vitest and a test script.
- Create `server/src/lib/signupValidation.ts`: pure API-side name/password validation using the same rules and messages.
- Create `server/src/lib/signupValidation.test.ts`: unit tests proving invalid requests are rejected before route side effects.
- Modify `server/src/routes/auth.ts`: validate signup input before database access and store the normalized name.
- Modify `server/package.json` and `server/package-lock.json`: add Vitest, TypeScript, and a test script.

### Task 1: Add Client Validation Tests and Test Runner

**Files:**
- Create: `client/src/lib/signupValidation.test.ts`
- Modify: `client/package.json`
- Modify: `client/package-lock.json`

- [ ] **Step 1: Install the client test runner**

Run:

```bash
cd client
npm install --save-dev vitest
```

Expected: `vitest` is added to `devDependencies` and `client/package-lock.json` changes.

- [ ] **Step 2: Add the client test script**

Add this entry to `client/package.json` under `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing client validator tests**

Create `client/src/lib/signupValidation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  validateSignupName,
  validateSignupPassword,
} from "./signupValidation";

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
```

- [ ] **Step 4: Run the client tests to verify they fail**

Run:

```bash
cd client
npm test -- src/lib/signupValidation.test.ts
```

Expected: FAIL because `./signupValidation` does not exist.

- [ ] **Step 5: Commit the failing client tests**

```bash
git add client/package.json client/package-lock.json client/src/lib/signupValidation.test.ts
git commit -m "test: define register validation rules"
```

### Task 2: Implement the Client Validator

**Files:**
- Create: `client/src/lib/signupValidation.ts`
- Test: `client/src/lib/signupValidation.test.ts`

- [ ] **Step 1: Create the minimal client validation module**

Create `client/src/lib/signupValidation.ts`:

```ts
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
```

- [ ] **Step 2: Run the client validator tests**

Run:

```bash
cd client
npm test -- src/lib/signupValidation.test.ts
```

Expected: PASS for all name and password validation cases.

- [ ] **Step 3: Commit the client validator**

```bash
git add client/src/lib/signupValidation.ts
git commit -m "feat: add register input validators"
```

### Task 3: Integrate Validation into the Register Form

**Files:**
- Modify: `client/src/pages/Signup.tsx`
- Modify: `client/src/context/AuthContext.tsx`
- Test: `client/src/lib/signupValidation.test.ts`

- [ ] **Step 1: Import the validators in the Register page**

Add to `client/src/pages/Signup.tsx`:

```ts
import {
  validateSignupName,
  validateSignupPassword,
} from "@/lib/signupValidation";
```

- [ ] **Step 2: Validate name and password before password confirmation and API submission**

Replace the validation section at the start of `handleSubmit` with:

```ts
event.preventDefault();
setError("");

const nameResult = validateSignupName(name);
if (!nameResult.valid) {
  setError(nameResult.message);
  return;
}

const passwordResult = validateSignupPassword(password);
if (!passwordResult.valid) {
  setError(passwordResult.message);
  return;
}

if (password !== confirmPassword) {
  setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
  return;
}

setSubmitting(true);

const success = await signup(
  email.trim(),
  passwordResult.value,
  nameResult.value
);
```

This ordering ensures invalid inputs never call `signup`.

- [ ] **Step 3: Add browser-level field constraints without relying on them for security**

Update the name input in `client/src/pages/Signup.tsx`:

```tsx
<input
  id="signup-name"
  type="text"
  value={name}
  onChange={(e) => {
    setName(e.target.value);
    setError("");
  }}
  placeholder="เช่น คุณแม่"
  minLength={2}
  maxLength={50}
  required
  aria-invalid={Boolean(error)}
  className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
/>
```

Update both password inputs with:

```tsx
minLength={8}
maxLength={64}
```

- [ ] **Step 4: Make name required in the authentication API contract**

In `client/src/context/AuthContext.tsx`, change both signup signatures from optional to required:

```ts
signup: (email: string, password: string, name: string) => Promise<boolean>;
```

```ts
async (email: string, password: string, name: string) => {
```

- [ ] **Step 5: Run client tests, lint, and build**

Run:

```bash
cd client
npm test
npm run lint
npm run build
```

Expected: tests pass, lint reports no new errors, and Vite completes a production build.

- [ ] **Step 6: Commit the Register integration**

```bash
git add client/src/pages/Signup.tsx client/src/context/AuthContext.tsx
git commit -m "fix: block invalid register submissions"
```

### Task 4: Add Server Validation Tests and Test Runner

**Files:**
- Create: `server/src/lib/signupValidation.test.ts`
- Modify: `server/package.json`
- Modify: `server/package-lock.json`

- [ ] **Step 1: Install server test dependencies**

Run:

```bash
cd server
npm install --save-dev typescript vitest
```

Expected: `typescript` and `vitest` are added to `devDependencies`; `server/package-lock.json` changes.

- [ ] **Step 2: Add the server test script**

Add this entry to `server/package.json` under `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write failing API validator tests**

Create `server/src/lib/signupValidation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateSignupInput } from "./signupValidation";

const validInput = {
  name: "สมชาย ใจดี",
  email: "test@example.com",
  password: "Abcd1234",
};

describe("validateSignupInput", () => {
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
```

- [ ] **Step 4: Run the server test to verify it fails**

Run:

```bash
cd server
npm test -- src/lib/signupValidation.test.ts
```

Expected: FAIL because `./signupValidation` does not exist.

- [ ] **Step 5: Commit the failing server tests**

```bash
git add server/package.json server/package-lock.json server/src/lib/signupValidation.test.ts
git commit -m "test: cover signup API validation"
```

### Task 5: Implement Server Validation and Protect the Signup Route

**Files:**
- Create: `server/src/lib/signupValidation.ts`
- Modify: `server/src/routes/auth.ts`
- Test: `server/src/lib/signupValidation.test.ts`

- [ ] **Step 1: Create the server validation module**

Create `server/src/lib/signupValidation.ts`:

```ts
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
```

- [ ] **Step 2: Run the server validator tests**

Run:

```bash
cd server
npm test -- src/lib/signupValidation.test.ts
```

Expected: PASS for every invalid and valid signup case.

- [ ] **Step 3: Validate at the beginning of the signup route**

In `server/src/routes/auth.ts`, add:

```ts
import { validateSignupInput } from "../lib/signupValidation";
```

Replace the signup route’s existing body parsing and `email/password` required check with:

```ts
const body = await c.req.json();
const validation = validateSignupInput(body);

if (!validation.valid) {
  return c.json(
    { success: false, message: validation.message },
    400
  );
}

const { email, password, name } = validation.value;
```

Keep this block before the `JWT_SECRET` check, database query, password hashing, insert, and token creation. Remove the old nullable-name conversion:

```ts
const name = body?.name ? String(body.name).trim() : null;
```

- [ ] **Step 4: Run server tests and TypeScript validation**

Run:

```bash
cd server
npm test
npx tsc --noEmit
```

Expected: all tests pass and TypeScript exits with code 0.

- [ ] **Step 5: Commit API enforcement**

```bash
git add server/src/lib/signupValidation.ts server/src/routes/auth.ts
git commit -m "fix: enforce signup validation in API"
```

### Task 6: End-to-End Regression Verification

**Files:**
- Verify: `client/src/pages/Signup.tsx`
- Verify: `client/src/context/AuthContext.tsx`
- Verify: `server/src/routes/auth.ts`
- Verify: `client/src/lib/signupValidation.test.ts`
- Verify: `server/src/lib/signupValidation.test.ts`

- [ ] **Step 1: Run the complete automated verification**

Run:

```bash
cd client
npm test
npm run lint
npm run build
cd ../server
npm test
npx tsc --noEmit
```

Expected: all commands exit with code 0.

- [ ] **Step 2: Start the local application**

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

Expected: Wrangler and Vite report their local URLs without startup errors.

- [ ] **Step 3: Manually verify the Register acceptance cases**

Submit each case and confirm no signup request succeeds:

1. Name is only spaces → `กรุณากรอกชื่อ`.
2. Name is one character → `ชื่อต้องมีอย่างน้อย 2 ตัวอักษร`.
3. Name contains `!`, `_`, or digits → `ชื่อมีรูปแบบไม่ถูกต้อง`.
4. Name has 51 characters → `ชื่อต้องไม่ยาวเกิน 50 ตัวอักษร`.
5. Password is empty or 1–7 characters → `รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร`.
6. Password has 65 characters → `รหัสผ่านต้องไม่ยาวเกิน 64 ตัวอักษร`.
7. Password contains Thai characters → `รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษเป็นหลัก`.
8. Valid name `สมชาย ใจดี` and password `Abcd1234` → signup proceeds normally.

- [ ] **Step 4: Verify direct API bypass attempts**

Send invalid payloads directly to `/auth/signup` and confirm each returns HTTP 400 with the matching Thai `message`, and confirm no user row is created:

```bash
curl -i -X POST http://localhost:8787/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":" ","email":"space-name@example.com","password":"Abcd1234"}'
```

```bash
curl -i -X POST http://localhost:8787/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"สมชาย","email":"thai-password@example.com","password":"รหัสผ่าน123"}'
```

Expected: both responses have status `400`; neither request reaches password hashing or database insertion.

- [ ] **Step 5: Commit any verification-only corrections**

If verification exposes a mismatch, make only the smallest correction, rerun Step 1, then commit the corrected files:

```bash
git add client/src server/src client/package.json client/package-lock.json server/package.json server/package-lock.json
git commit -m "test: complete register validation regression coverage"
```

If no corrections are needed, do not create an empty commit.

## Requirements Traceability

| User requirement | Covered by |
|---|---|
| 1. Name containing only spaces must be rejected | Tasks 1, 2, 4, 5, 6 |
| 2. Invalid name must be rejected with a useful message | Tasks 1–6 |
| 3. Name must contain at least 2 characters | Tasks 1, 2, 4, 5, 6 |
| 4. Special characters in name must be rejected | Tasks 1, 2, 4, 5, 6 |
| 6. Name must not exceed 50 characters | Tasks 1, 2, 4, 5, 6 |
| 7. Empty password must report the 8-character minimum | Tasks 1, 2, 4, 5, 6 |
| 8. Password shorter than 8 characters must be rejected | Tasks 1, 2, 4, 5, 6 |
| 9. Password must not exceed 64 characters | Tasks 1, 2, 4, 5, 6 |
| 10. Thai/non-English password must be rejected | Tasks 1, 2, 4, 5, 6 |

