export const extractColorsFromImage = (imageUri: string): string[] => {
  // Esta función sería reemplazada por la API de Colormind
  const fallbackColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#6c5ce7', '#74b9ff', '#0dbedc', '#00b894', '#fdcb6e',
    '#fd79a8', '#e17055', '#55efc4', '#a29bfe', '#dda0dd'
  ];
  
  // Simular extracción de colores
  const numberOfColors = Math.floor(Math.random() * 3) + 3; // 3-5 colores
  const selectedColors: string[] = [];
  
  for (let i = 0; i < numberOfColors; i++) {
    const randomIndex = Math.floor(Math.random() * fallbackColors.length);
    const color = fallbackColors[randomIndex];
    if (!selectedColors.includes(color)) {
      selectedColors.push(color);
    }
  }
  
  return selectedColors;
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const getContrastColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};
