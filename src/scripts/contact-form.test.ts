import { describe, expect, it } from "vitest";
import { formspreeErrorMessage } from "./contact-form";

describe("formspreeErrorMessage", () => {
  it("joins field errors into a sentence", () => {
    expect(
      formspreeErrorMessage({
        errors: [{ field: "email", message: "should be an email" }],
      }),
    ).toBe("email should be an email.");
  });

  it("falls back to a generic message", () => {
    expect(formspreeErrorMessage(null)).toBe(
      "Something went wrong sending your message.",
    );
    expect(formspreeErrorMessage({ errors: [] })).toBe(
      "Something went wrong sending your message.",
    );
  });
});
