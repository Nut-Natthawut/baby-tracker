import sharp from 'sharp';
import { readFileSync } from 'fs';

const width = 1200;
const height = 630;

// Read the favicon SVG and resize it for embedding
const babyLogoSvg = readFileSync('./public/favicon.svg', 'utf-8');

// Create the OG image as an SVG, then convert to PNG
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="50%" stop-color="#1a1520"/>
      <stop offset="100%" stop-color="#1e1210"/>
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(20, 85%, 65%)" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(20, 85%, 75%)" />
      <stop offset="100%" stop-color="hsl(16, 80%, 65%)" />
    </linearGradient>
    <linearGradient id="faceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4D6" />
      <stop offset="100%" stop-color="#F5D0C5" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" rx="0"/>
  
  <!-- Glow effect -->
  <ellipse cx="420" cy="315" rx="300" ry="250" fill="url(#glowGrad)"/>
  
  <!-- Decorative dots -->
  <circle cx="100" cy="100" r="3" fill="hsl(20, 70%, 60%)" opacity="0.3"/>
  <circle cx="1100" cy="530" r="4" fill="hsl(20, 70%, 60%)" opacity="0.2"/>
  <circle cx="950" cy="120" r="2" fill="hsl(20, 70%, 60%)" opacity="0.4"/>
  <circle cx="200" cy="500" r="3" fill="hsl(20, 70%, 60%)" opacity="0.25"/>
  
  <!-- Baby logo (large) -->
  <g transform="translate(300, 195) scale(2.4)">
    <circle cx="50" cy="50" r="48" fill="url(#logoBg)" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="white" stroke-width="2" opacity="0.3" />
    <g transform="translate(50, 52)">
      <ellipse cx="0" cy="0" rx="26" ry="28" fill="url(#faceGrad)" />
      <ellipse cx="0" cy="-22" rx="18" ry="10" fill="#8B7355" />
      <circle cx="-15" cy="-18" r="6" fill="#8B7355" />
      <circle cx="15" cy="-18" r="6" fill="#8B7355" />
      <path d="M0 -32 Q5 -40 10 -32 Q5 -36 0 -32" fill="#8B7355" />
      <circle cx="0" cy="-30" r="4" fill="#8B7355" />
      <circle cx="-25" cy="-4" r="6" fill="#F5D0C5" />
      <circle cx="25" cy="-4" r="6" fill="#F5D0C5" />
      <ellipse cx="-16" cy="6" rx="6" ry="4" fill="#FFCCBC" opacity="0.8" />
      <ellipse cx="16" cy="6" rx="6" ry="4" fill="#FFCCBC" opacity="0.8" />
      <ellipse cx="-9" cy="-4" rx="4" ry="5" fill="#3D3D3D" />
      <ellipse cx="9" cy="-4" rx="4" ry="5" fill="#3D3D3D" />
      <circle cx="-7.5" cy="-5.5" r="1.5" fill="white" />
      <circle cx="10.5" cy="-5.5" r="1.5" fill="white" />
      <path d="M-8 10 Q0 18 8 10" stroke="#E88B8B" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    <g fill="#FF9AA2" opacity="0.9">
      <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="scale(0.5) translate(140, 30)" />
      <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="scale(0.4) translate(35, 50)" />
    </g>
  </g>
  
  <!-- Text: Baby Tracker -->
  <text x="680" y="270" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" fill="#F5A574">Baby</text>
  <text x="680" y="350" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" fill="#E8D5C8">Tracker</text>
  
  <!-- Subtitle -->
  <text x="680" y="410" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#9A8A7A" opacity="0.9">Baby Care Recording</text>
  
  <!-- Bottom line decoration -->
  <rect x="680" y="440" width="120" height="3" rx="1.5" fill="hsl(20, 85%, 65%)" opacity="0.6"/>
  
  <!-- Hearts decoration -->
  <g fill="#FF9AA2" opacity="0.4">
    <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="translate(1050, 180) scale(1.2)" />
    <path d="M18 20 C18 18, 15 15, 12 18 C9 15, 6 18, 6 20 C6 24, 12 28, 12 28 C12 28, 18 24, 18 20" transform="translate(1080, 220) scale(0.8)" />
  </g>
</svg>
`;

await sharp(Buffer.from(ogSvg))
    .png()
    .toFile('./public/og-image.png');

console.log('✅ OG image generated: public/og-image.png');
