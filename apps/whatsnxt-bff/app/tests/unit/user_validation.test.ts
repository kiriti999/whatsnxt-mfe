import { describe, it, expect } from "vitest";
import User from "../../common/models/user";

describe("User Model Validation", () => {
  it("should fail validation when password is an empty string (minlength check)", async () => {
    const user = new User({
      name: "Test Empty Pass",
      email: "empty@example.com",
      password: "",
      googleId: "123",
      role: "student",
    });

    try {
      await user.validate();
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.errors.password).toBeDefined();
      expect(error.errors.password.kind).toBe("minlength");
    }
  });

  it("should pass validation when password field is omitted (for social login)", async () => {
    const user = new User({
      name: "Test No Pass",
      email: "nopass@example.com",
      // password omitted
      googleId: "123",
      role: "student",
    });

    await user.validate(); // Should pass
    expect(true).toBe(true);
  });
});
