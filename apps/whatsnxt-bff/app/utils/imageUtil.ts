function textToSVGBase64(
  text,
  backgroundColor = "blue",
  fontColor = "white",
  width = 309,
  height = 174,
) {
  // Create SVG content
  const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        <text
          x="50%"
          y="50%"
          font-size="30"
          font-family="Arial, sans-serif"
          font-weight="bold"
          fill="${fontColor}"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ${text}
        </text>
      </svg>
    `;

  // Encode SVG to Base64
  const base64SVG = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
  return base64SVG;
}

export default textToSVGBase64;
