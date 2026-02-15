const opentype = require("opentype.js");
const fs = require("fs");
const path = require("path");

const defaultFontPath = path.join(
  __dirname,
  "..",
  "public",
  "fonts",
  "Montserrat-Bold.ttf"
);
const defaultOutPath = path.join(
  __dirname,
  "..",
  "public",
  "fonts",
  "montserrat-bold.typeface.json"
);
const [inputArg, outputArg] = process.argv.slice(2);
const fontPath = inputArg ? path.resolve(process.cwd(), inputArg) : defaultFontPath;
const outPath = outputArg ? path.resolve(process.cwd(), outputArg) : defaultOutPath;

const font = opentype.loadSync(fontPath);
const resolution = 1000;
const scale = resolution / font.unitsPerEm;

// Characters we need
const charset = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?-:;'\"()";

const glyphs = {};

for (const char of charset) {
  const glyph = font.charToGlyph(char);
  if (!glyph || glyph.index === 0) continue;

  // Get path at the target resolution
  const glyphPath = glyph.getPath(0, 0, resolution);
  let o = "";

  for (const cmd of glyphPath.commands) {
    switch (cmd.type) {
      case "M":
        o += `m ${Math.round(cmd.x)} ${Math.round(cmd.y)} `;
        break;
      case "L":
        o += `l ${Math.round(cmd.x)} ${Math.round(cmd.y)} `;
        break;
      case "Q":
        o += `q ${Math.round(cmd.x1)} ${Math.round(cmd.y1)} ${Math.round(cmd.x)} ${Math.round(cmd.y)} `;
        break;
      case "C":
        o += `b ${Math.round(cmd.x1)} ${Math.round(cmd.y1)} ${Math.round(cmd.x2)} ${Math.round(cmd.y2)} ${Math.round(cmd.x)} ${Math.round(cmd.y)} `;
        break;
      case "Z":
        // three.js Font parser doesn't use 'z', paths are auto-closed
        break;
    }
  }

  glyphs[char] = {
    o: o.trim(),
    ha: Math.round(glyph.advanceWidth * scale),
    x_min: Math.round((glyph.xMin || 0) * scale),
    x_max: Math.round((glyph.xMax || 0) * scale),
  };
}

const result = {
  glyphs,
  familyName: font.names.fontFamily?.en || "Montserrat",
  ascender: Math.round(font.ascender * scale),
  descender: Math.round(font.descender * scale),
  underlinePosition: Math.round((font.tables.post?.underlinePosition || -100) * scale),
  underlineThickness: Math.round((font.tables.post?.underlineThickness || 50) * scale),
  boundingBox: {
    yMin: Math.round((font.tables.head?.yMin || 0) * scale),
    xMin: Math.round((font.tables.head?.xMin || 0) * scale),
    yMax: Math.round((font.tables.head?.yMax || 0) * scale),
    xMax: Math.round((font.tables.head?.xMax || 0) * scale),
  },
  resolution,
  original_font_information: {
    format: 0,
    copyright: font.names.copyright?.en || "",
    fontFamily: font.names.fontFamily?.en || "Montserrat",
    fontSubfamily: font.names.fontSubfamily?.en || "Bold",
    fullName: font.names.fullName?.en || "Montserrat Bold",
  },
};

fs.writeFileSync(outPath, JSON.stringify(result));
console.log(`Converted font saved to ${outPath}`);
console.log(`Glyphs count: ${Object.keys(glyphs).length}`);
