import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ColorPalette } from '../types';
import { PaletteCard } from '../components/PaletteCard';
import databaseService from '../services/UniversalDatabaseService';

export const FavoritesScreen: React.FC = () => {
  const [favoritePalettes, setFavoritePalettes] = useState<ColorPalette[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavoritePalettes();
    }, [])
  );

  const loadFavoritePalettes = async () => {
    setIsLoading(true);
    try {
      const favorites = await databaseService.getFavoritePalettes();
      setFavoritePalettes(favorites);
    } catch (error) {
      console.error('Error loading favorite palettes:', error);
      Alert.alert('Error', 'No se pudieron cargar las paletas favoritas');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavoritePalettes();
    setRefreshing(false);
  }, []);

  const handleToggleFavorite = async (id: number) => {
    try {
      const palette = favoritePalettes.find(p => p.id === id);
      if (palette) {
        await databaseService.updatePalette(id, {
          isFavorite: !palette.isFavorite
        });
        
        // Si se desmarca como favorito, lo removemos de la lista
        if (palette.isFavorite) {
          setFavoritePalettes(prevPalettes =>
            prevPalettes.filter(p => p.id !== id)
          );
        } else {
          // Si se marca como favorito, actualizamos el estado
          setFavoritePalettes(prevPalettes =>
            prevPalettes.map(p =>
              p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
            )
          );
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar el favorito');
    }
  };

  const handleDeletePalette = async (id: number) => {
    try {
      await databaseService.deletePalette(id);
      setFavoritePalettes(prevPalettes => 
        prevPalettes.filter(p => p.id !== id)
      );
      Alert.alert('Éxito', 'Paleta eliminada correctamente');
    } catch (error) {
      console.error('Error deleting palette:', error);
      Alert.alert('Error', 'No se pudo eliminar la paleta');
    }
  };

  const handleColorPress = (color: string) => {
    Alert.alert('Color copiado', `Color ${color} copiado al portapapeles`);
  };

  const renderPaletteCard = ({ item }: { item: ColorPalette }) => (
    <PaletteCard
      palette={item}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDeletePalette}
      onColorPress={handleColorPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No hay paletas favoritas</Text>
      <Text style={styles.emptySubtitle}>
        Marca tus paletas como favoritas para verlas aquí
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritePalettes}
        renderItem={renderPaletteCard}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff4757']}
            tintColor="#ff4757"
            progressBackgroundColor="#1e1e1e"
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});
