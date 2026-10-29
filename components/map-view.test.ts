import { describe, expect, it } from "vitest";
import { classifyMapError } from "./map-view";

describe("classifyMapError", () => {
  it("treats source and tile request failures as recoverable", () => {
    expect(classifyMapError({ sourceId: "openfreemap" }, false)).toBe("tile");
    expect(classifyMapError({ tile: {} }, true)).toBe("tile");
  });

  it("treats an initial error without source metadata as a style failure", () => {
    expect(classifyMapError({}, false)).toBe("style");
  });

  it("reports post-style non-tile errors as degraded rather than fatal", () => {
    expect(classifyMapError({}, true)).toBe("degraded");
  });
});
