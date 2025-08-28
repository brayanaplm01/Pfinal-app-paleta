import { Platform } from 'react-native';
import { ColorPalette } from '../types';

// Importación condicional basada en la plataforma
let DatabaseService: any;

if (Platform.OS === 'web') {
  // Para web, usamos AsyncStorage
  DatabaseService = require('./WebDatabaseService').default;
} else {
  // Para móvil, usamos SQLite
  DatabaseService = require('./ExpoDatabaseService').default;
}

class UniversalDatabaseService {
  async initDB(): Promise<void> {
    return DatabaseService.initDB();
  }

  async savePalette(palette: Omit<ColorPalette, 'id'>): Promise<number> {
    return DatabaseService.savePalette(palette);
  }

  async getAllPalettes(): Promise<ColorPalette[]> {
    return DatabaseService.getAllPalettes();
  }

  async getFavoritePalettes(): Promise<ColorPalette[]> {
    return DatabaseService.getFavoritePalettes();
  }

  async updatePalette(id: number, updates: Partial<ColorPalette>): Promise<void> {
    return DatabaseService.updatePalette(id, updates);
  }

  async deletePalette(id: number): Promise<void> {
    return DatabaseService.deletePalette(id);
  }
}

export default new UniversalDatabaseService();
