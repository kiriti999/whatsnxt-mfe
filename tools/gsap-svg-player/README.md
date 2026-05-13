# GSAP SVG Animation Player

Browser-based SVG animation player using GSAP DrawSVGPlugin. Animates your existing D3-generated SVGs by targeting elements with `data-node-id` and `data-edge-id` attributes.

## Why GSAP?

Unlike canvas-based tools (Remotion, Motion Canvas, Manim), GSAP animates the **actual SVG DOM elements**:

- **DrawSVGPlugin**: Progressively draws strokes (arrows, lines) from 0% to 100%
- **No rebuild needed**: Works with your existing D3-generated SVGs
- **Full fidelity**: Exact same visual as the static SVG
- **Timeline control**: Play, pause, seek, reverse

## Quick Start

```bash
# From root directory
pnpm gsap:serve    # Start server at http://localhost:8080
```

Or manually:
```bash
cd tools/gsap-svg-player
npx serve -p 8080
# Open http://localhost:8080
```

## How It Works

1. **Save bundle from frontend** → files land in `bundle/`:
   - `manifest.json` - Animation segments
   - `diagram.svg` - Your D3-generated SVG

2. **Open player** → GSAP reads manifest and animates each element

3. **Export** → Use screen recording (OBS, QuickTime) to capture

## Animation Effects

| Effect | Description | GSAP Method |
|--------|-------------|-------------|
| `fade` | Fade in with scale | `opacity`, `scale` |
| `strokeReveal` | Draw line progressively | `drawSVG: "0% → 100%"` |
| `pulse` | Scale bounce | `scale: 1 → 1.05 → 1` |
| `highlight` | Glow effect | `filter: drop-shadow` |

## SVG Requirements

Your D3 renderer must add these attributes:

```javascript
// For nodes (cards, boxes)
g.attr("data-node-id", node.id);

// For edges (arrows, lines)
line.attr("data-edge-id", edge.id);

// For mini-flow boxes inside cards
boxGroup.attr("data-box-id", `${nodeId}-box-${index}`);
```

The PatternCatalogRenderer already has these attributes.

## Manifest Format

```json
{
  "version": 1,
  "compositionDurationInFrames": 180,
  "segments": [
    {
      "id": "seg-1",
      "durationInFrames": 30,
      "effect": "fade",
      "target": { "kind": "node", "nodeId": "node-1" },
      "label": "First card appears"
    },
    {
      "id": "seg-2", 
      "durationInFrames": 45,
      "effect": "strokeReveal",
      "target": { "kind": "edge", "edgeId": "node-1-edge-1" },
      "label": "Arrow draws"
    }
  ]
}
```

## Exporting Video

Options for recording:

1. **Screen Recording** (Easiest)
   - OBS Studio, QuickTime, or built-in screen recorder
   - Set browser to fullscreen
   - Play animation and record

2. **Puppeteer + ffmpeg** (Automated)
   - Use Puppeteer to control browser
   - Capture frames with `page.screenshot()`
   - Stitch with ffmpeg

3. **Chrome DevTools**
   - Open DevTools → More tools → Rendering
   - Enable "Capture screenshots"
   - Play animation at reduced speed

## Comparison with Other Tools

| Tool | Approach | Arrow Animation | Effort |
|------|----------|-----------------|--------|
| **GSAP Player** | DOM-based | DrawSVG ✅ | Low |
| Remotion | Canvas + SVG string | Regex hacks ⚠️ | Medium |
| Motion Canvas | Canvas rebuild | Native Line.end() | High |
| Manim | Python render | Limited ❌ | High |

GSAP is the best fit because it works directly with your existing SVGs without rebuilding.
