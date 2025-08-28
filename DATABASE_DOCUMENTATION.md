# Base de Datos SQLite - Color Palette Generator

## Esquema de la Base de Datos

### Tabla: `palettes`

```sql
CREATE TABLE IF NOT EXISTS palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  colors TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  imageUri TEXT,
  isFavorite INTEGER DEFAULT 0
);
```

### Campos de la Tabla

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `id` | INTEGER | Identificador único autoincremental | Sí (AUTO) |
| `name` | TEXT | Nombre de la paleta | Sí |
| `colors` | TEXT | Array de colores en formato JSON | Sí |
| `createdAt` | TEXT | Fecha de creación en formato ISO | Sí |
| `imageUri` | TEXT | URI de la imagen asociada | No |
| `isFavorite` | INTEGER | Marcador de favorito (0/1) | No (Default: 0) |

### Ejemplo de Datos

```json
{
  "id": 1,
  "name": "Sunset Vibes",
  "colors": "[\"#FF6B35\", \"#F7931E\", \"#FFD23F\", \"#06FFA5\", \"#4D9DE0\"]",
  "createdAt": "2025-08-24T23:15:30.000Z",
  "imageUri": "file:///storage/image.jpg",
  "isFavorite": 1
}
```

## Operaciones CRUD Implementadas

### 1. CREATE - Guardar Paleta
```typescript
async savePalette(palette: Omit<ColorPalette, 'id'>): Promise<number>
```
- Inserta nueva paleta en la base de datos
- Retorna el ID asignado automáticamente
- Convierte el array de colores a JSON

### 2. READ - Leer Paletas
```typescript
// Obtener todas las paletas
async getAllPalettes(): Promise<ColorPalette[]>

// Obtener solo favoritas
async getFavoritePalettes(): Promise<ColorPalette[]>
```
- Ordenadas por fecha de creación (más recientes primero)
- Convierte JSON de colores de vuelta a array
- Convierte 0/1 a boolean para isFavorite

### 3. UPDATE - Actualizar Paleta
```typescript
async updatePalette(id: number, updates: Partial<ColorPalette>): Promise<void>
```
- Actualización parcial de campos
- Construcción dinámica de query SQL
- Validación de campos a actualizar

### 4. DELETE - Eliminar Paleta
```typescript
async deletePalette(id: number): Promise<void>
```
- Eliminación por ID
- Confirmación requerida en UI

## Servicios Adicionales

### DatabaseUtils
Utilidades extra para gestión avanzada:

1. **Estadísticas de DB**
   ```typescript
   getDatabaseStats(): Promise<{
     totalPalettes: number;
     favoritePalettes: number;
     oldestPalette: string | null;
     newestPalette: string | null;
     mostUsedColors: string[];
   }>
   ```

2. **Exportar/Importar**
   ```typescript
   exportDatabase(): Promise<string>
   ```

3. **Búsqueda**
   ```typescript
   searchPalettes(query: string): Promise<ColorPalette[]>
   ```

4. **Mantenimiento**
   ```typescript
   clearDatabase(): Promise<void>
   checkDatabaseIntegrity(): Promise<boolean>
   getDatabaseSize(): Promise<string>
   ```

## Inicialización de la Base de Datos

La base de datos se inicializa automáticamente al cargar la aplicación:

1. **HomeScreen** llama a `initializeDatabase()` usando `useFocusEffect`
2. Se abre la conexión a `colorpalettes.db`
3. Se crean las tablas si no existen
4. Se confirma la creación exitosa

```typescript
const initializeDatabase = async () => {
  try {
    await expoDatabaseService.initDB();
  } catch (error) {
    console.error('Error initializing database:', error);
    Alert.alert('Error', 'No se pudo inicializar la base de datos');
  }
};
```

## Ubicación de la Base de Datos

- **Desarrollo**: Almacenada localmente en el dispositivo/emulador
- **Producción**: `Documents` folder del dispositivo móvil
- **Web**: IndexedDB del navegador (via expo-sqlite)

## Consideraciones de Rendimiento

1. **Índices**: ID es clave primaria automática
2. **JSON Storage**: Los colores se almacenan como JSON para flexibilidad
3. **Consultas Optimizadas**: ORDER BY en createdAt para listados cronológicos
4. **Transacciones**: Usando async/await para operaciones atómicas

## Backup y Migración

### Exportar Datos
```typescript
const exportData = await DatabaseUtils.exportDatabase();
// Resultado: JSON con metadatos y todas las paletas
```

### Restaurar Datos
Implementar función de importación que:
1. Parse del JSON exportado
2. Validación de estructura
3. Inserción batch de paletas

## Extensiones Futuras

### Posibles Mejoras:
1. **Índices adicionales** en `name` para búsquedas
2. **Tabla de colores separada** para normalización
3. **Historial de cambios** (audit trail)
4. **Categorías/Tags** para organización
5. **Sincronización en la nube** (Firebase/Supabase)

### Esquema Extendido (Futuro):
```sql
CREATE TABLE colors (
  id INTEGER PRIMARY KEY,
  hex TEXT UNIQUE NOT NULL,
  name TEXT,
  usage_count INTEGER DEFAULT 0
);

CREATE TABLE palette_colors (
  palette_id INTEGER,
  color_id INTEGER,
  position INTEGER,
  FOREIGN KEY (palette_id) REFERENCES palettes(id),
  FOREIGN KEY (color_id) REFERENCES colors(id)
);
```

## Troubleshooting

### Errores Comunes:
1. **Database not initialized**: Llamar a `initDB()` primero
2. **JSON Parse Error**: Validar formato de colores
3. **Constraint violations**: Verificar campos NOT NULL

### Debug Mode:
Activar logs detallados en desarrollo:
```typescript
console.log('Database operation:', operation, params);
```

## Testing

### Datos de Prueba:
Use `DatabaseUtils.insertSampleData()` para agregar paletas de ejemplo y probar funcionalidades.

---

**Implementado por**: GitHub Copilot
**Fecha**: Agosto 2025
**Versión**: 1.0
