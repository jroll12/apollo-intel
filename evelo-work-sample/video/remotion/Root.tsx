import { Composition } from "remotion";
import "./fonts";
import { Smoke } from "./Smoke";

export const FPS = 30;
// 9:16 for Reels/Shorts/TikTok; 4:5 for the feed.
export const PORTRAIT = { width: 1080, height: 1920 } as const;
export const FEED = { width: 1080, height: 1350 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Smoke" component={Smoke} durationInFrames={30} fps={FPS} {...PORTRAIT} />
      <Composition id="Smoke-4x5" component={Smoke} durationInFrames={30} fps={FPS} {...FEED} />
    </>
  );
};
