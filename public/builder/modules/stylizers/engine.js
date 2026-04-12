import { applyHalftone } from "./halftone.js";
import { applyManga } from "./manga.js";
import { applyNoir } from "./noir.js";
import { applyCartoon } from "./cartoon.js";

export class StylizerEngine {
  async applyStyle(ctx, panel, styleKey) {
    const { x, y, w, h } = panel;
    const imageData = ctx.getImageData(x, y, w, h);

    switch (styleKey) {
      case "halftone":
        applyHalftone(imageData);
        break;
      case "manga":
        applyManga(imageData);
        break;
      case "noir":
        applyNoir(imageData);
        break;
      case "cartoon":
        applyCartoon(imageData);
        break;
      default:
        break;
    }

    ctx.putImageData(imageData, x, y);
  }
}
