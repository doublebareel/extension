import { describe, it, expect } from "vitest";
import { normalizeUrl } from "../../src/shared/utils";

describe("normalizeUrl", () =>
{
    it("strips the query string and hash from a url", () =>
    {

        const example = "https://example.com/page?foo=bar#section";
        expect(normalizeUrl(example)).toBe(
            "https://example.com/page"
        );
    });
});
