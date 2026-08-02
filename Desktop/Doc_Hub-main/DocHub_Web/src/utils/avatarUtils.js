// src/utils/avatarUtils.js - SVG Vector Initials Avatar Generator
const COLOR_PALETTE = [
  '#1E4B8F', // Deep Judicial Blue
  '#7C5CFC', // Royal Notarial Purple
  '#2F6FED', // Bright Legal Blue
  '#1FA971', // Emerald Green
  '#D98A11', // Amber Gold
  '#E5484D', // Ruby Red
  '#0EA5E9', // Sky Blue
  '#8B5CF6'  // Violet
];

export function getInitialsAvatar(name, customColor = null) {
  if (!name) return '';
  const cleanName = name.replace(/^(Lic\.|Not\.|Dra\.|Dr\.|Ing\.|Mtro\.|Mtra\.)\s+/i, '').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (parts[0] ? parts[0].substring(0, 2).toUpperCase() : 'US');

  // Determine hash index for consistent color per user
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = customColor || COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="${color}"/>
    <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
