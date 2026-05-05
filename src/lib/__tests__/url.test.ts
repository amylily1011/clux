import { describe, it, expect } from "vitest";
import { isSafeUrl, toRawUrl } from "../url";

describe("isSafeUrl", () => {
  it("allows a normal https URL", () => {
    expect(isSafeUrl("https://example.com/docs").safe).toBe(true);
  });

  it("allows a normal http URL", () => {
    expect(isSafeUrl("http://example.com/docs").safe).toBe(true);
  });

  it("blocks localhost", () => {
    expect(isSafeUrl("http://localhost:3000").safe).toBe(false);
  });

  it("blocks 127.x.x.x", () => {
    expect(isSafeUrl("http://127.0.0.1").safe).toBe(false);
  });

  it("blocks 10.x.x.x private range", () => {
    expect(isSafeUrl("http://10.0.0.1/internal").safe).toBe(false);
  });

  it("blocks 192.168.x.x private range", () => {
    expect(isSafeUrl("http://192.168.1.1").safe).toBe(false);
  });

  it("blocks 172.16-31.x.x private range", () => {
    expect(isSafeUrl("http://172.16.0.1").safe).toBe(false);
    expect(isSafeUrl("http://172.31.255.255").safe).toBe(false);
  });

  it("blocks GCP metadata endpoint", () => {
    expect(isSafeUrl("http://169.254.169.254/metadata").safe).toBe(false);
  });

  it("blocks metadata.google.internal", () => {
    expect(isSafeUrl("http://metadata.google.internal").safe).toBe(false);
  });

  it("blocks non-http protocols", () => {
    expect(isSafeUrl("ftp://example.com").safe).toBe(false);
    expect(isSafeUrl("file:///etc/passwd").safe).toBe(false);
  });

  it("returns error reason on failure", () => {
    const result = isSafeUrl("http://localhost");
    expect(result.safe).toBe(false);
    expect(result.reason).toBeTruthy();
  });
});

describe("toRawUrl", () => {
  it("converts GitHub blob URLs to raw.githubusercontent.com", () => {
    const blob = "https://github.com/cli/cli/blob/main/docs/README.md";
    expect(toRawUrl(blob)).toBe("https://raw.githubusercontent.com/cli/cli/main/docs/README.md");
  });

  it("handles nested paths in blob URLs", () => {
    const blob = "https://github.com/org/repo/blob/v1.2.3/src/lib/config.ts";
    expect(toRawUrl(blob)).toBe("https://raw.githubusercontent.com/org/repo/v1.2.3/src/lib/config.ts");
  });

  it("leaves non-GitHub URLs unchanged", () => {
    const url = "https://example.com/docs.md";
    expect(toRawUrl(url)).toBe(url);
  });

  it("leaves raw.githubusercontent.com URLs unchanged", () => {
    const raw = "https://raw.githubusercontent.com/cli/cli/main/README.md";
    expect(toRawUrl(raw)).toBe(raw);
  });
});
