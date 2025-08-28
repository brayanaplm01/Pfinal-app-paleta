import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ColorPalette } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { Ionicons } from '@expo/vector-icons';

interface PaletteCardProps {
  palette: ColorPalette;
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onColorPress?: (color: string) => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  onToggleFavorite,
  onDelete,
  onColorPress
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Paleta',
      '¿Estás seguro de que quieres eliminar esta paleta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(palette.id!),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{palette.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onToggleFavorite(palette.id!)}
            style={styles.actionButton}
          >
            <Ionicons
              name={palette.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={palette.isFavorite ? '#ff4757' : '#888888'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={24} color="#888888" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.colorsContainer}>
        {palette.colors.map((color, index) => (
          <ColorSwatch
            key={index}
            color={color}
            size={50}
            onPress={onColorPress}
          />
        ))}
      </View>
      
      <Text style={styles.date}>{formatDate(palette.createdAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingVertical: 8,
  },
  date: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
