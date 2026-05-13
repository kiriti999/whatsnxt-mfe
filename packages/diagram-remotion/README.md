# @whatsnxt/diagram-remotion

GSAP-driven Remotion composition for diagram animation rendering.

## How it works

The composition uses the **GSAP** animation library (npm package) to animate diagram SVG elements. For each Remotion frame, the GSAP timeline is seeked to `frame / totalFrames`, so Remotion's headless Chrome captures exactly what GSAP renders at that point in time.

Animation logic mirrors the GSAP SVG player (`tools/gsap-svg-player/index.html`) exactly:
- Auto-discovers `[data-node-id]` and `[data-edge-id]` elements in the SVG
- Central node fades in first
- Then: Arrow N draws → Block N fades in, repeated for all numbered pairs
- `DrawSVGPlugin` draws arrow strokes progressively

## Local preview (Remotion Studio)

```bash
pnpm install
pnpm studio          # opens http://localhost:3000
```

## Cloud deploy (Remotion Lambda)

```bash
cd ../../whatsnxt-bff/lambda/diagram-animation
./deploy-remotion.sh
```

Then set in BFF `.env`:
```
REMOTION_DIAGRAM_REGION=ap-south-1
REMOTION_DIAGRAM_FUNCTION_NAME=remotion-render-...
REMOTION_DIAGRAM_SERVE_URL=https://remotionlambda-...s3.amazonaws.com/sites/whatsnxt-diagram-animation/index.html
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `diagramSvg` | `string` | Raw SVG string (with `data-node-id`/`data-edge-id` attributes) |
| `diagramData` | `object` | Diagram JSON (used to estimate animation duration) |
| `animationManifest` | `object` | Animation manifest (reserved, GSAP auto-discovers elements) |
