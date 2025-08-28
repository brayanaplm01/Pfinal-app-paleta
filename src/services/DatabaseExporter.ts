import { Platform } from 'react-native';
import databaseService from './UniversalDatabaseService';

class DatabaseExporter {
  // Exportar todos los datos como JSON
  async exportAllData(): Promise<string> {
    try {
      const allPalettes = await databaseService.getAllPalettes();
      const exportData = {
        platform: Platform.OS,
        exportDate: new Date().toISOString(),
        totalPalettes: allPalettes.length,
        favoritePalettes: allPalettes.filter(p => p.isFavorite).length,
        palettes: allPalettes
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Imprimir datos en consola para debug
  async debugDatabase(): Promise<void> {
    try {
      const exportData = await this.exportAllData();
      console.log('=== DATABASE CONTENTS ===');
      console.log(exportData);
      console.log('========================');
      
      // También imprimir estadísticas
      const allPalettes = await databaseService.getAllPalettes();
      console.log(`📊 Total palettes: ${allPalettes.length}`);
      console.log(`💖 Favorites: ${allPalettes.filter(p => p.isFavorite).length}`);
      console.log(`🎨 Platform: ${Platform.OS}`);
    } catch (error) {
      console.error('Error debugging database:', error);
    }
  }

  // Obtener ubicación teórica del archivo
  getDatabaseLocation(): string {
    if (Platform.OS === 'web') {
      return 'Browser localStorage - Key: "colorpalettes"';
    } else if (Platform.OS === 'android') {
      return '/data/data/host.exp.exponent/files/ExperienceData/@anonymous/ColorPaletteApp-[hash]/SQLite/colorpalettes.db';
    } else if (Platform.OS === 'ios') {
      return '/var/mobile/Containers/Data/Application/[app-id]/Documents/ExpoExperienceData/@anonymous/ColorPaletteApp-[hash]/SQLite/colorpalettes.db';
    }
    return 'Unknown platform';
  }
}

export default new DatabaseExporter();
