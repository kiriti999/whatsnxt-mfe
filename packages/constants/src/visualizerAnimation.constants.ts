/** GIF output FPS bounds (Remotion + ffmpeg). */
export const DIAGRAM_ANIMATION_GIF_FPS = {
	MIN: 6,
	MAX: 24,
	DEFAULT: 12,
} as const;

export const DIAGRAM_RENDER_FORMAT = {
	GIF: "gif",
	MP4: "mp4",
	BOTH: "both",
} as const;

/** BFF `process.env` keys for Remotion Lambda diagram renders (`@remotion/lambda/client`). */
export const DIAGRAM_REMOTION_LAMBDA_ENV = {
	REGION: "REMOTION_DIAGRAM_REGION",
	FUNCTION_NAME: "REMOTION_DIAGRAM_FUNCTION_NAME",
	SERVE_URL: "REMOTION_DIAGRAM_SERVE_URL",
} as const;

/** BFF local Remotion CLI fallback when Lambda env is not set. */
export const DIAGRAM_REMOTION_LOCAL_ENV = {
	ROOT: "DIAGRAM_REMOTION_ROOT",
} as const;

export type DiagramRenderFormatValue =
	(typeof DIAGRAM_RENDER_FORMAT)[keyof typeof DIAGRAM_RENDER_FORMAT];
