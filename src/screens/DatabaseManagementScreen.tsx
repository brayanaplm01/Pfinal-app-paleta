import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatabaseUtils from '../services/DatabaseUtils';

export const DatabaseManagementScreen: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbSize, setDbSize] = useState<string>('');

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = async () => {
    setIsLoading(true);
    try {
      const [dbStats, size] = await Promise.all([
        DatabaseUtils.getDatabaseStats(),
        DatabaseUtils.getDatabaseSize()
      ]);
      
      setStats(dbStats);
      setDbSize(size);
    } catch (error) {
      console.error('Error loading database info:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la base de datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSampleData = async () => {
    Alert.alert(
      'Insertar Datos de Ejemplo',
      '¿Deseas agregar algunas paletas de ejemplo a la base de datos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Insertar',
          onPress: async () => {
            try {
              await DatabaseUtils.insertSampleData();
              Alert.alert('Éxito', 'Datos de ejemplo insertados correctamente');
              loadDatabaseInfo();
            } catch (error) {
              Alert.alert('Error', 'No se pudieron insertar los datos de ejemplo');
            }
          }
        }
      ]
    );
  };

  const handleExportDatabase = async () => {
    try {
      const exportData = await DatabaseUtils.exportDatabase();
      // En una implementación real, aquí guardarías el archivo o lo compartirías
      Alert.alert(
        'Exportación Completa',
        `Base de datos exportada exitosamente.\nTamaño: ${exportData.length} caracteres`,
        [
          { text: 'OK' }
        ]
      );
      console.log('Exported data:', exportData.substring(0, 200) + '...');
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar la base de datos');
    }
  };

  const handleClearDatabase = async () => {
    Alert.alert(
      'Limpiar Base de Datos',
      '⚠️ Esta acción eliminará TODAS las paletas guardadas. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseUtils.clearDatabase();
              Alert.alert('Éxito', 'Base de datos limpiada correctamente');
              loadDatabaseInfo();
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la base de datos');
            }
          }
        }
      ]
    );
  };

  const handleCheckIntegrity = async () => {
    try {
      const isIntegrityOk = await DatabaseUtils.checkDatabaseIntegrity();
      Alert.alert(
        'Verificación de Integridad',
        isIntegrityOk ? 
          '✅ La base de datos está en buen estado' : 
          '❌ Se detectaron problemas en la base de datos'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar la integridad de la base de datos');
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = 
    ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  if (isLoading && !stats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Administración de Base de Datos</Text>
        
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
            
            <StatCard
              title="Total de Paletas"
              value={stats.totalPalettes}
              icon="color-palette"
              color="#00D4AA"
            />
            
            <StatCard
              title="Paletas Favoritas"
              value={stats.favoritePalettes}
              icon="heart"
              color="#FF6B6B"
            />
            
            <StatCard
              title="Tamaño de DB"
              value={dbSize}
              icon="server"
              color="#4ECDC4"
            />
            
            {stats.mostUsedColors.length > 0 && (
              <View style={styles.colorsSection}>
                <Text style={styles.sectionTitle}>🎨 Colores Más Usados</Text>
                <View style={styles.colorsContainer}>
                  {stats.mostUsedColors.map((color: string, index: number) => (
                    <View key={index} style={styles.colorItem}>
                      <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                      <Text style={styles.colorText}>{color}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>🔧 Acciones</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={loadDatabaseInfo}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Actualizar Información</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]} 
            onPress={handleInsertSampleData}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Insertar Datos de Ejemplo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#45B7D1' }]} 
            onPress={handleExportDatabase}
          >
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Exportar Base de Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#96CEB4' }]} 
            onPress={handleCheckIntegrity}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Verificar Integridad</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]} 
            onPress={handleClearDatabase}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Limpiar Base de Datos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    marginTop: 20,
  },
  statsSection: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 16,
    color: '#cccccc',
    marginLeft: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  colorsSection: {
    marginTop: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  colorItem: {
    alignItems: 'center',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#444',
  },
  colorText: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#00D4AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
