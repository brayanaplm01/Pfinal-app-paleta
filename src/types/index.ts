export interface ColorPalette {
  id?: number;
  name: string;
  colors: string[];
  createdAt: string;
  imageUri?: string;
  isFavorite: boolean;
}

export interface ColorInfo {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
}
