import { describe, it, expect } from "vitest";
import { generateSlug, isValidSlug, suggestAlternative } from "../slug";

describe("generateSlug", () => {
  it("produces a valid slug", () => {
    const slug = generateSlug();
    expect(isValidSlug(slug)).toBe(true);
  });

  it("follows adj-noun-hex format", () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-z]+-[a-z]+-[0-9a-f]{4}$/);
  });

  it("generates different slugs on repeated calls", () => {
    const slugs = new Set(Array.from({ length: 20 }, generateSlug));
    expect(slugs.size).toBeGreaterThan(1);
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase alphanumeric with hyphens", () => {
    expect(isValidSlug("my-cool-cli")).toBe(true);
  });

  it("accepts slug at minimum length (3 chars)", () => {
    expect(isValidSlug("abc")).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(isValidSlug("My-Cli")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(isValidSlug("my cli")).toBe(false);
  });

  it("rejects slugs starting with a hyphen", () => {
    expect(isValidSlug("-my-cli")).toBe(false);
  });

  it("rejects slugs ending with a hyphen", () => {
    expect(isValidSlug("my-cli-")).toBe(false);
  });

  it("rejects slugs over 60 chars", () => {
    expect(isValidSlug("a".repeat(61))).toBe(false);
  });
});

describe("suggestAlternative", () => {
  it("appends -2 to a plain slug", () => {
    expect(suggestAlternative("my-cli")).toBe("my-cli-2");
  });

  it("increments an existing numeric suffix", () => {
    expect(suggestAlternative("my-cli-2")).toBe("my-cli-3");
    expect(suggestAlternative("my-cli-9")).toBe("my-cli-10");
  });
});
