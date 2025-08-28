import { Platform } from 'react-native';
import { ColorPalette } from '../types';
import WebDatabaseService from './WebDatabaseService';

// Para web/Vercel, siempre usar WebDatabaseService
// SQLite no funciona en entornos serverless como Vercel
class UniversalDatabaseService {
  async initDB(): Promise<void> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.initDB();
    } else {
      // En móvil, importar dinámicamente para evitar errores en web
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.initDB();
    }
  }

  async savePalette(palette: Omit<ColorPalette, 'id'>): Promise<number> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.savePalette(palette);
    } else {
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.savePalette(palette);
    }
  }

  async getAllPalettes(): Promise<ColorPalette[]> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.getAllPalettes();
    } else {
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.getAllPalettes();
    }
  }

  async getFavoritePalettes(): Promise<ColorPalette[]> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.getFavoritePalettes();
    } else {
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.getFavoritePalettes();
    }
  }

  async updatePalette(id: number, updates: Partial<ColorPalette>): Promise<void> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.updatePalette(id, updates);
    } else {
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.updatePalette(id, updates);
    }
  }

  async deletePalette(id: number): Promise<void> {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      return WebDatabaseService.deletePalette(id);
    } else {
      const { default: ExpoDatabaseService } = await import('./ExpoDatabaseService');
      return ExpoDatabaseService.deletePalette(id);
    }
  }
}

export default new UniversalDatabaseService();
