// Fonts are bundled from node_modules (@fontsource), so rendering never touches the network.
// Importing the CSS registers the @font-face rules; the delayRender below holds the first
// frame until the faces are actually decoded, so no frame is captured with a fallback font.
import "@fontsource/bricolage-grotesque/latin-500.css";
import "@fontsource/bricolage-grotesque/latin-700.css";
import "@fontsource/bricolage-grotesque/latin-800.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import { continueRender, delayRender } from "remotion";

export const DISPLAY_FONT = '"Bricolage Grotesque", sans-serif';
export const BODY_FONT = '"Inter", sans-serif';

const FACES = [
  '500 64px "Bricolage Grotesque"',
  '700 64px "Bricolage Grotesque"',
  '800 64px "Bricolage Grotesque"',
  '400 32px "Inter"',
  '600 32px "Inter"',
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading bundled fonts");
  Promise.all(FACES.map((face) => document.fonts.load(face)))
    .then(() => document.fonts.ready)
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Font loading failed", err);
      continueRender(handle);
    });
}
