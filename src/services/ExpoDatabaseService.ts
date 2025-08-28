import * as SQLite from 'expo-sqlite';
import { ColorPalette } from '../types';

class ExpoDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDB(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('colorpalettes.db');
      
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS palettes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          colors TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          imageUri TEXT,
          isFavorite INTEGER DEFAULT 0
        )
      `);
      console.log('Palettes table created successfully');
    } catch (error) {
      console.error('Error creating palettes table:', error);
      throw error;
    }
  }

  async savePalette(palette: Omit<ColorPalette, 'id'>): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.runAsync(
        `INSERT INTO palettes (name, colors, createdAt, imageUri, isFavorite) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          palette.name,
          JSON.stringify(palette.colors),
          palette.createdAt,
          palette.imageUri || null,
          palette.isFavorite ? 1 : 0
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error saving palette:', error);
      throw error;
    }
  }

  async getAllPalettes(): Promise<ColorPalette[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync('SELECT * FROM palettes ORDER BY createdAt DESC');
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        colors: JSON.parse(row.colors),
        createdAt: row.createdAt,
        imageUri: row.imageUri,
        isFavorite: row.isFavorite === 1
      }));
    } catch (error) {
      console.error('Error getting palettes:', error);
      throw error;
    }
  }

  async getFavoritePalettes(): Promise<ColorPalette[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM palettes WHERE isFavorite = 1 ORDER BY createdAt DESC'
      );
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        colors: JSON.parse(row.colors),
        createdAt: row.createdAt,
        imageUri: row.imageUri,
        isFavorite: row.isFavorite === 1
      }));
    } catch (error) {
      console.error('Error getting favorite palettes:', error);
      throw error;
    }
  }

  async updatePalette(id: number, updates: Partial<ColorPalette>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const setClause = [];
    const values = [];

    if (updates.name) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.colors) {
      setClause.push('colors = ?');
      values.push(JSON.stringify(updates.colors));
    }
    if (updates.isFavorite !== undefined) {
      setClause.push('isFavorite = ?');
      values.push(updates.isFavorite ? 1 : 0);
    }
    if (updates.imageUri) {
      setClause.push('imageUri = ?');
      values.push(updates.imageUri);
    }

    values.push(id);

    try {
      await this.db.runAsync(
        `UPDATE palettes SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating palette:', error);
      throw error;
    }
  }

  async deletePalette(id: number): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.runAsync('DELETE FROM palettes WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting palette:', error);
      throw error;
    }
  }
}

export default new ExpoDatabaseService();
