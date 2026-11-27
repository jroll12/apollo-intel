import { Composition } from "remotion";
import "./fonts";
import { Reel, fullSegments, segmentsFrames, type Segment } from "./Reel";
import { T, scene } from "./data";

export const FPS = T.fps;
// 9:16 for Reels/Shorts/TikTok; 4:5 for the feed.
export const PORTRAIT = { width: 1080, height: 1920 } as const;
export const FEED = { width: 1080, height: 1350 } as const;

// Short cut for Stories: hook, the price beat, then the CTA and end card.
const SHORT: Segment[] = [
  [0, scene("hook").end],
  [scene("price").start, scene("price").end],
  [T.keyTimes.call - 0.02, T.duration],
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Reel" component={Reel} durationInFrames={segmentsFrames(fullSegments())} fps={FPS} {...PORTRAIT} defaultProps={{ format: "portrait" as const }} />
      <Composition id="Reel-4x5" component={Reel} durationInFrames={segmentsFrames(fullSegments())} fps={FPS} {...FEED} defaultProps={{ format: "feed" as const }} />
      <Composition id="Reel-short" component={Reel} durationInFrames={segmentsFrames(SHORT)} fps={FPS} {...PORTRAIT} defaultProps={{ format: "portrait" as const, segments: SHORT }} />
    </>
  );
};
