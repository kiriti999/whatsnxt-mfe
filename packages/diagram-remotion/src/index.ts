import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);

export { RemotionRoot };
export { DiagramAnimation } from "./DiagramAnimation";
export type { DiagramAnimationProps } from "./DiagramAnimation";
export { calculateMetadata } from "./Root";
