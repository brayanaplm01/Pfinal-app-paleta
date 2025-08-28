import * as SQLite from 'expo-sqlite';
import expoDatabaseService from './ExpoDatabaseService';

class DatabaseUtils {
  // Obtener estadísticas de la base de datos
  async getDatabaseStats(): Promise<{
    totalPalettes: number;
    favoritePalettes: number;
    oldestPalette: string | null;
    newestPalette: string | null;
    mostUsedColors: string[];
  }> {
    try {
      const allPalettes = await expoDatabaseService.getAllPalettes();
      const favoritePalettes = await expoDatabaseService.getFavoritePalettes();
      
      // Contar colores más usados
      const colorCount: { [key: string]: number } = {};
      allPalettes.forEach(palette => {
        palette.colors.forEach(color => {
          colorCount[color] = (colorCount[color] || 0) + 1;
        });
      });
      
      const mostUsedColors = Object.entries(colorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color]) => color);
      
      const dates = allPalettes.map(p => p.createdAt).sort();
      
      return {
        totalPalettes: allPalettes.length,
        favoritePalettes: favoritePalettes.length,
        oldestPalette: dates.length > 0 ? dates[0] : null,
        newestPalette: dates.length > 0 ? dates[dates.length - 1] : null,
        mostUsedColors
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  // Exportar datos para backup
  async exportDatabase(): Promise<string> {
    try {
      const allPalettes = await expoDatabaseService.getAllPalettes();
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        palettes: allPalettes
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting database:', error);
      throw error;
    }
  }

  // Buscar paletas por nombre o color
  async searchPalettes(query: string): Promise<any[]> {
    try {
      const allPalettes = await expoDatabaseService.getAllPalettes();
      const lowercaseQuery = query.toLowerCase();
      
      return allPalettes.filter(palette => 
        palette.name.toLowerCase().includes(lowercaseQuery) ||
        palette.colors.some(color => 
          color.toLowerCase().includes(lowercaseQuery)
        )
      );
    } catch (error) {
      console.error('Error searching palettes:', error);
      throw error;
    }
  }

  // Limpiar base de datos (eliminar todas las paletas)
  async clearDatabase(): Promise<void> {
    try {
      const db = await SQLite.openDatabaseAsync('colorpalettes.db');
      await db.runAsync('DELETE FROM palettes');
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  // Insertar datos de ejemplo
  async insertSampleData(): Promise<void> {
    try {
      const samplePalettes = [
        {
          name: 'Sunset Vibes',
          colors: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#4D9DE0'],
          createdAt: new Date().toISOString(),
          isFavorite: true
        },
        {
          name: 'Ocean Deep',
          colors: ['#006A6B', '#0E8388', '#2E8B57', '#5F9EA0', '#87CEEB'],
          createdAt: new Date().toISOString(),
          isFavorite: false
        },
        {
          name: 'Neon Dreams',
          colors: ['#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
          createdAt: new Date().toISOString(),
          isFavorite: true
        },
        {
          name: 'Forest Harmony',
          colors: ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'],
          createdAt: new Date().toISOString(),
          isFavorite: false
        }
      ];

      for (const palette of samplePalettes) {
        await expoDatabaseService.savePalette(palette);
      }
      
      console.log('Sample data inserted successfully');
    } catch (error) {
      console.error('Error inserting sample data:', error);
      throw error;
    }
  }

  // Verificar integridad de la base de datos
  async checkDatabaseIntegrity(): Promise<boolean> {
    try {
      const db = await SQLite.openDatabaseAsync('colorpalettes.db');
      const result = await db.getFirstAsync('PRAGMA integrity_check');
      return result !== null;
    } catch (error) {
      console.error('Error checking database integrity:', error);
      return false;
    }
  }

  // Obtener tamaño de la base de datos
  async getDatabaseSize(): Promise<string> {
    try {
      const db = await SQLite.openDatabaseAsync('colorpalettes.db');
      const result = await db.getFirstAsync('PRAGMA page_count') as any;
      const pageSize = await db.getFirstAsync('PRAGMA page_size') as any;
      
      if (result && pageSize) {
        const sizeInBytes = result.page_count * pageSize.page_size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        return `${sizeInKB} KB`;
      }
      
      return 'Unknown';
    } catch (error) {
      console.error('Error getting database size:', error);
      return 'Error';
    }
  }
}

export default new DatabaseUtils();
