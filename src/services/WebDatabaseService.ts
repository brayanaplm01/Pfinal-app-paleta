import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette } from '../types';

class WebDatabaseService {
  private readonly STORAGE_KEY = 'colorpalettes';

  async initDB(): Promise<void> {
    try {
      // Para web, no necesitamos inicialización especial
      console.log('Web database service initialized');
    } catch (error) {
      console.error('Error initializing web database:', error);
      throw error;
    }
  }

  async savePalette(palette: Omit<ColorPalette, 'id'>): Promise<number> {
    try {
      const existingPalettes = await this.getAllPalettes();
      const newId = Date.now(); // Usar timestamp como ID único
      
      const newPalette: ColorPalette = {
        ...palette,
        id: newId
      };

      const updatedPalettes = [...existingPalettes, newPalette];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPalettes));
      
      return newId;
    } catch (error) {
      console.error('Error saving palette:', error);
      throw error;
    }
  }

  async getAllPalettes(): Promise<ColorPalette[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting palettes:', error);
      return [];
    }
  }

  async getFavoritePalettes(): Promise<ColorPalette[]> {
    try {
      const allPalettes = await this.getAllPalettes();
      return allPalettes.filter(palette => palette.isFavorite);
    } catch (error) {
      console.error('Error getting favorite palettes:', error);
      return [];
    }
  }

  async updatePalette(id: number, updates: Partial<ColorPalette>): Promise<void> {
    try {
      const allPalettes = await this.getAllPalettes();
      const updatedPalettes = allPalettes.map(palette =>
        palette.id === id ? { ...palette, ...updates } : palette
      );
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPalettes));
    } catch (error) {
      console.error('Error updating palette:', error);
      throw error;
    }
  }

  async deletePalette(id: number): Promise<void> {
    try {
      const allPalettes = await this.getAllPalettes();
      const filteredPalettes = allPalettes.filter(palette => palette.id !== id);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPalettes));
    } catch (error) {
      console.error('Error deleting palette:', error);
      throw error;
    }
  }
}

export default new WebDatabaseService();
