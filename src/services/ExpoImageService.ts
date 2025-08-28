import * as ImagePicker from 'expo-image-picker';

class ExpoImageService {
  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async selectImageFromGallery(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Se requieren permisos para acceder a la galería de fotos');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
      return null;
    }
  }

  async captureImageFromCamera(): Promise<string | null> {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Se requieren permisos para acceder a la cámara');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error capturing image from camera:', error);
      return null;
    }
  }

  async showImagePicker(): Promise<string | null> {
    return new Promise((resolve) => {
      const options = [
        {
          text: 'Cámara',
          onPress: async () => {
            const imageUri = await this.captureImageFromCamera();
            resolve(imageUri);
          }
        },
        {
          text: 'Galería',
          onPress: async () => {
            const imageUri = await this.selectImageFromGallery();
            resolve(imageUri);
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel' as const,
          onPress: () => resolve(null)
        }
      ];

      // En React Native necesitamos usar Alert.alert para mostrar opciones
      // Por ahora devolvemos la galería como opción por defecto
      this.selectImageFromGallery().then(resolve);
    });
  }
}

export default new ExpoImageService();
