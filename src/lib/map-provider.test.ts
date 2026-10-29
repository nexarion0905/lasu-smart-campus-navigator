import { describe, expect, it } from "vitest";
import { resolveMapStyleUrl } from "./map-provider";

describe("resolveMapStyleUrl", () => {
  it("uses the documented no-key style when configuration is missing or blank", () => {
    expect(resolveMapStyleUrl()).toBe("https://tiles.openfreemap.org/styles/positron");
    expect(resolveMapStyleUrl("  ")).toBe("https://tiles.openfreemap.org/styles/positron");
  });

  it("accepts HTTPS style URLs and rejects invalid or credential-bearing URLs", () => {
    expect(resolveMapStyleUrl("https://maps.example/style.json")).toBe(
      "https://maps.example/style.json",
    );
    expect(resolveMapStyleUrl("not-a-url")).toBeNull();
    expect(resolveMapStyleUrl("http://maps.example/style.json")).toBeNull();
    expect(resolveMapStyleUrl("https://user:secret@maps.example/style.json")).toBeNull();
  });
});
