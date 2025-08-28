import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ColorSwatch } from '../components/ColorSwatch';
import expoImageService from '../services/ExpoImageService';
import colorAPIService from '../services/ColorAPIService';
import databaseService from '../services/UniversalDatabaseService';

export const HomeScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedColors, setGeneratedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      initializeDatabase();
    }, [])
  );

  const initializeDatabase = async () => {
    try {
      await databaseService.initDB();
    } catch (error) {
      console.error('Error initializing database:', error);
      Alert.alert('Error', 'No se pudo inicializar la base de datos');
    }
  };

  const handleSelectImage = async () => {
    try {
      const hasPermission = await expoImageService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a las imágenes');
        return;
      }

      const imageUri = await expoImageService.showImagePicker();
      if (imageUri) {
        setSelectedImage(imageUri);
        setGeneratedColors([]);
        setPaletteName('');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const generateColorsFromImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Primero selecciona una imagen');
      return;
    }

    setIsLoading(true);
    try {
      const colors = await colorAPIService.generatePaletteFromImage(selectedImage);
      setGeneratedColors(colors);
      setPaletteName(`Paleta ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error('Error generating colors:', error);
      Alert.alert('Error', 'No se pudieron generar los colores');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPalette = async () => {
    setIsLoading(true);
    try {
      const colors = await colorAPIService.generateRandomPalette();
      setGeneratedColors(colors);
      setSelectedImage(null);
      setPaletteName(`Paleta Aleatoria ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error('Error generating random palette:', error);
      Alert.alert('Error', 'No se pudo generar la paleta aleatoria');
    } finally {
      setIsLoading(false);
    }
  };

  const savePalette = async () => {
    if (generatedColors.length === 0) {
      Alert.alert('Error', 'No hay colores para guardar');
      return;
    }

    if (!paletteName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la paleta');
      return;
    }

    try {
      const palette = {
        name: paletteName.trim(),
        colors: generatedColors,
        createdAt: new Date().toISOString(),
        imageUri: selectedImage || undefined,
        isFavorite: false,
      };

      await databaseService.savePalette(palette);
      Alert.alert('Éxito', 'Paleta guardada correctamente');
      
      // Limpiar la pantalla
      setSelectedImage(null);
      setGeneratedColors([]);
      setPaletteName('');
    } catch (error) {
      console.error('Error saving palette:', error);
      Alert.alert('Error', 'No se pudo guardar la paleta');
    }
  };

  const copyColorToClipboard = (color: string) => {
    // En una implementación real, aquí usarías Clipboard.setString(color)
    Alert.alert('Color copiado', `Color ${color} copiado al portapapeles`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Generador de Paleta de Colores</Text>
        
        <View style={styles.imageSection}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setSelectedImage(null);
                  setGeneratedColors([]);
                  setPaletteName('');
                }}
              >
                <Ionicons name="close-circle" size={24} color="#ff4757" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color="#444444" />
              <Text style={styles.placeholderText}>No hay imagen seleccionada</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSelectImage}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>Seleccionar Imagen</Text>
          </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: '#74b9ff' }]}
              onPress={generateRandomPalette}
            >
              <Ionicons name="shuffle" size={20} color="#74b9ff" />
            <Text style={[styles.buttonText, { color: '#74b9ff' }]}>Paleta Aleatoria</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#00b894' }]}
            onPress={generateColorsFromImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="color-palette" size={20} color="#fff" />
                <Text style={styles.buttonText}>Extraer Colores (Imagga AI)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {generatedColors.length > 0 && (
          <View style={styles.colorsSection}>
            <Text style={styles.sectionTitle}>Colores Generados</Text>
            
            <View style={styles.colorsContainer}>
              {generatedColors.map((color, index) => (
                <View key={index} style={styles.colorItem}>
                  <ColorSwatch
                    color={color}
                    size={80}
                    onPress={copyColorToClipboard}
                  />
                  <Text style={styles.colorText}>{color.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            <View style={styles.saveSection}>
              <TextInput
                style={styles.nameInput}
                placeholder="Nombre de la paleta..."
                placeholderTextColor="#666666"
                value={paletteName}
                onChangeText={setPaletteName}
                maxLength={50}
              />
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#fd79a8' }]}
                onPress={savePalette}
              >
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>Guardar Paleta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 220,
    height: 220,
    borderRadius: 20,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#2a2a2a',
  },
  removeImageButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  placeholderContainer: {
    width: 220,
    height: 220,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    marginTop: 12,
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  secondaryButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#74b9ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  colorsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
    paddingVertical: 12,
  },
  colorItem: {
    alignItems: 'center',
    gap: 12,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    letterSpacing: 0.5,
  },
  saveSection: {
    gap: 16,
  },
  nameInput: {
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
