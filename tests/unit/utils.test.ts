import { describe, it, expect } from "vitest";
import { normalizeUrl } from "../../src/shared/utils";

describe("normalizeUrl", () =>
{

  it("removes tracking params while keeping the rest", () =>
  {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter&fbclid=abc123&feature=share";
    expect(normalizeUrl(url)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("upgrades http to https", () =>
  {
    expect(normalizeUrl("http://example.com/article")).toBe("https://example.com/article");
  });

  it("lowercases the hostname", () =>
  {
    expect(normalizeUrl("https://EN.Wikipedia.ORG/wiki/Cat")).toBe("https://en.wikipedia.org/wiki/Cat");
  });

  it("strips a trailing slash from the path", () =>
  {
    expect(normalizeUrl("https://example.com/blog/post/")).toBe("https://example.com/blog/post");
  });

  it("keeps the root path slash", () =>
  {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("sorts query params so equivalent urls match", () =>
  {
    expect(normalizeUrl("https://example.com/search?b=2&a=1")).toBe("https://example.com/search?a=1&b=2");
  });
});
