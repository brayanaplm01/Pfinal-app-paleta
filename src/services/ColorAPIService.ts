import imaggaAPIService from './ImaggaAPIService';

class ColorAPIService {
  private readonly COLORMIND_API_URL = 'http://colormind.io/api/';

  async generatePaletteFromImage(imageUri: string): Promise<string[]> {
    try {
      console.log('Generating palette from image using Imagga API:', imageUri);
      
      // Usar Imagga API para extracción real de colores
      const colors = await imaggaAPIService.generatePaletteFromImage(imageUri);
      
      if (colors && colors.length > 0) {
        console.log('Successfully extracted colors from Imagga:', colors);
        return colors;
      }
      
      // Si Imagga falla, usar paleta de fallback
      console.log('Imagga extraction failed, using fallback palette');
      return this.getFallbackPalette();
      
    } catch (error) {
      console.error('Error generating palette from image:', error);
      return this.getFallbackPalette();
    }
  }

  async generateRandomPalette(): Promise<string[]> {
    try {
      const response = await fetch(this.COLORMIND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'default'
        })
      });

      if (!response.ok) {
        throw new Error('API response not ok');
      }

      const data = await response.json();
      
      if (data.result) {
        return data.result.map((rgb: number[]) => 
          `#${rgb.map(value => 
            Math.round(value).toString(16).padStart(2, '0')
          ).join('')}`
        );
      }
      
      return this.getFallbackPalette();
    } catch (error) {
      console.error('Error generating random palette:', error);
      return this.getFallbackPalette();
    }
  }

  private getFallbackPalette(): string[] {
    const palettes = [
      ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'],
      ['#ff6348', '#ff4757', '#747d8c', '#a4b0be', '#57606f'],
      ['#2ed573', '#ffa502', '#ff6348', '#ff4757', '#5352ed'],
      ['#70a1ff', '#5352ed', '#ff4757', '#ff6348', '#2ed573'],
      ['#6c5ce7', '#74b9ff', '#0dbedc', '#00b894', '#fdcb6e'],
      ['#e17055', '#d63031', '#74b9ff', '#0984e3', '#6c5ce7'],
      ['#fd79a8', '#fdcb6e', '#e17055', '#00b894', '#74b9ff'],
      ['#00cec9', '#55efc4', '#fd79a8', '#e84393', '#a29bfe'],
      ['#ff7675', '#fd79a8', '#fdcb6e', '#55efc4', '#74b9ff'],
      ['#636e72', '#2d3436', '#00b894', '#00cec9', '#55efc4'],
      ['#a29bfe', '#6c5ce7', '#fd79a8', '#e84393', '#ff7675'],
      ['#fab1a0', '#e17055', '#00cec9', '#55efc4', '#fdcb6e'],
      ['#ff7675', '#74b9ff', '#55efc4', '#fdcb6e', '#fd79a8'],
      ['#dda0dd', '#98fb98', '#87ceeb', '#f0e68c', '#ffa07a']
    ];
    
    const randomIndex = Math.floor(Math.random() * palettes.length);
    return palettes[randomIndex];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }
}

export default new ColorAPIService();
