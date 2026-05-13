// Liquid Glass filter generator for Mission Control
// Based on the liquid-glass skill — SVG displacement + chromatic aberration

export const getLiquidGlassFilter = ({
  width, height, radius, depth = 10, strength = 80, chromaticAberration = 2
}: {
  width: number; height: number; radius: number; depth?: number; strength?: number; chromaticAberration?: number;
}) => {
  const map = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="Y" x1="0" x2="0" y1="${Math.ceil((radius / height) * 15)}%" y2="${Math.floor(100 - (radius / height) * 15)}%">
          <stop offset="0%" stop-color="#0F0" /><stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient id="X" x1="${Math.ceil((radius / width) * 15)}%" x2="${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0">
          <stop offset="0%" stop-color="#F00" /><stop offset="100%" stop-color="#000" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
      <g filter="blur(2px)">
        <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" style="mix-blend-mode:screen" />
        <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" style="mix-blend-mode:screen" />
        <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
      </g>
    </svg>`)}`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="displace" color-interpolation-filters="sRGB">
        <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${strength + chromaticAberration * 2}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${strength + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="G" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b" />
        <feBlend in="r" in2="g" mode="screen" />
        <feBlend in2="b" mode="screen" />
      </filter>
    </svg>`)}#displace`;
};

// Pre-built filter URLs for common sizes (avoids recalculating)
// These are approximate — the SVG filter handles varying sizes gracefully
export const GLASS_PRESETS = {
  card: { depth: 8, strength: 60, chromaticAberration: 1.5, blur: 12 },
  sidebar: { depth: 12, strength: 80, chromaticAberration: 2, blur: 16 },
  button: { depth: 6, strength: 40, chromaticAberration: 1, blur: 8 },
  metric: { depth: 6, strength: 40, chromaticAberration: 1, blur: 10 },
} as const;
