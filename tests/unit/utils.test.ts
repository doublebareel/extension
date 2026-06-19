import { describe, it, expect } from "vitest";
import { normalizeUrl } from "../../src/shared/utils";

describe("normalizeUrl", () =>
{
    it("strips the query string and hash from a url", () =>
    {
        expect(normalizeUrl("https://example.com/page?foo=bar#section")).toBe(
            "https://example.com/page"
        );
    });
});
