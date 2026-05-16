import { describe, it, expect } from "vitest";
import { generateCloverSVG } from "./cloverSvg";

describe("generateCloverSVG", () => {
  it("returns SVG markup with size baked into width/height/viewBox", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 120, scale: 1, rotation: 0 });
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('width="56"');
    expect(svg).toContain('height="56"');
    expect(svg).toContain('viewBox="0 0 56 56"');
  });

  it("renders exactly 3 ellipses for a 3-leaf clover", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 120, scale: 1, rotation: 0 });
    expect(svg.match(/<ellipse/g)?.length).toBe(3);
  });

  it("renders exactly 4 ellipses for a 4-leaf clover", () => {
    const svg = generateCloverSVG({ leaves: 4, hue: 120, scale: 1, rotation: 0 });
    expect(svg.match(/<ellipse/g)?.length).toBe(4);
  });

  it("spaces leaves evenly around the center (4 leaves → 90° apart)", () => {
    const svg = generateCloverSVG({ leaves: 4, hue: 120, scale: 1, rotation: 0 });
    expect(svg).toMatch(/rotate\(0 /);
    expect(svg).toMatch(/rotate\(90 /);
    expect(svg).toMatch(/rotate\(180 /);
    expect(svg).toMatch(/rotate\(270 /);
  });

  it("spaces leaves evenly around the center (3 leaves → 120° apart)", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 0, scale: 1, rotation: 0 });
    expect(svg).toMatch(/rotate\(0 /);
    expect(svg).toMatch(/rotate\(120 /);
    expect(svg).toMatch(/rotate\(240 /);
  });

  it("offsets every leaf by the rotation parameter", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 0, scale: 1, rotation: 45 });
    expect(svg).toMatch(/rotate\(45 /);
    expect(svg).toMatch(/rotate\(165 /);
    expect(svg).toMatch(/rotate\(285 /);
  });

  it("scales dimensions proportionally", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 0, scale: 2, rotation: 0 });
    expect(svg).toContain('width="112"');
    expect(svg).toContain('height="112"');
  });

  it("bakes hue into HSL fill colors", () => {
    const svg = generateCloverSVG({ leaves: 3, hue: 200, scale: 1, rotation: 0 });
    expect(svg).toContain("hsl(200,");
  });
});
