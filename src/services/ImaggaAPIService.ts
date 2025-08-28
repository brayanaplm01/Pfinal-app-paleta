import { Platform } from 'react-native';

class ImaggaAPIService {
  private readonly API_KEY = 'acc_d1f1d58f6f45686';
  private readonly API_SECRET = 'ace3c9f62f9eb954611afaab462ccffc';
  private readonly BASE_URL = 'https://api.imagga.com/v2';
  
  // Cola de peticiones para evitar llamadas concurrentes
  private requestQueue: Promise<any> = Promise.resolve();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre peticiones

  // Usar la autorización en formato Basic Auth como muestra el curl
  private getAuthHeader(): string {
    // Formato correcto según la documentación: user:password en Base64
    const credentials = `${this.API_KEY}:${this.API_SECRET}`;
    const base64Credentials = btoa(credentials);
    console.log('🔑 Using correct Basic Auth format');
    return `Basic ${base64Credentials}`;
  }

  // Método para manejar la cola de peticiones y evitar concurrencia
  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue.then(async () => {
        try {
          // Asegurar que haya un intervalo mínimo entre peticiones
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`⏳ Esperando ${delay}ms para evitar límites de concurrencia...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          this.lastRequestTime = Date.now();
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Método para reintentos con backoff exponencial
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Si es un error 403 por límites concurrentes, reintentar
        if (error.message && error.message.includes('403') && 
            (error.message.toLowerCase().includes('concurrent') || 
             error.message.toLowerCase().includes('limit'))) {
          
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} falló por límites. Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Para otros errores, no reintentar
        throw error;
      }
    }
    
    throw new Error('Max retries reached');
  }

  // Verificar el estado de la API y el límite de cuota
  async checkAPIStatus(): Promise<{ isWorking: boolean; usage?: any; error?: string }> {
    try {
      console.log('🔍 Checking Imagga API status...');
      
      const authHeader = this.getAuthHeader();
      console.log('🔑 Testing with auth header (first 30 chars):', authHeader.substring(0, 30) + '...');
      
      const response = await fetch(`${this.BASE_URL}/usage`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'User-Agent': 'ColorPaletteApp/1.0',
        },
      });

      console.log('📊 API Usage check status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Usage check error response:', errorText);
        
        return {
          isWorking: false,
          error: `API Status Check Failed: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      console.log('📊 API Usage Info:', data);
      
      return {
        isWorking: true,
        usage: data.result
      };
    } catch (error) {
      console.error('❌ Error checking API status:', error);
      return {
        isWorking: false,
        error: 'Network error or CORS issue'
      };
    }
  }

  // Subir imagen a Imagga y obtener su ID
  async uploadImage(imageUri: string): Promise<string | null> {
    try {
      console.log('Uploading image to Imagga:', imageUri);
      
      return await this.queueRequest(async () => {
        return await this.retryWithBackoff(async () => {
          // Crear FormData para la imagen
          const formData = new FormData();
          
          // En React Native, necesitamos crear un objeto file-like
          const imageFile = {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'palette_image.jpg',
          } as any;
          
          formData.append('image', imageFile);

          const response = await fetch(`${this.BASE_URL}/uploads`, {
            method: 'POST',
            headers: {
              'Authorization': this.getAuthHeader(),
            },
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Upload error response:', errorText);
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Upload response:', data);
          
          if (data.result && data.result.upload_id) {
            return data.result.upload_id;
          }
          
          return null;
        });
      });
    } catch (error) {
      console.error('Error uploading image to Imagga:', error);
      return null;
    }
  }

  // Extraer colores usando el ID de la imagen subida
  async extractColorsFromUploadId(uploadId: string): Promise<string[]> {
    try {
      console.log('Extracting colors for upload ID:', uploadId);
      
      return await this.queueRequest(async () => {
        return await this.retryWithBackoff(async () => {
          const authHeader = this.getAuthHeader();
          console.log('🔑 Using auth header (first 20 chars):', authHeader.substring(0, 20) + '...');
          
          const response = await fetch(
            `${this.BASE_URL}/colors?image_upload_id=${uploadId}&extract_object_colors=0&extract_overall_colors=1&overall_count=6`,
            {
              method: 'GET',
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
                'User-Agent': 'ColorPaletteApp/1.0',
              },
            }
          );

          console.log('Color extraction response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ API Error response body:', errorText);
            
            // Intentar parsear la respuesta como JSON para obtener más detalles
            let errorDetails = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error && errorJson.error.message) {
                errorDetails = errorJson.error.message;
              }
            } catch (parseError) {
              // Si no se puede parsear como JSON, usar el texto original
            }
            
            if (response.status === 403) {
              console.log('❌ API 403 Error: Verificando credenciales...');
              
              // Detectar si es un problema de límites
              if (errorDetails.toLowerCase().includes('monthly') || 
                  errorDetails.toLowerCase().includes('limit') ||
                  errorDetails.toLowerCase().includes('concurrent')) {
                console.log('⚠️ Detectado error de límites/concurrencia');
              }
            } else if (response.status === 429) {
              console.log('❌ API 429 Error: Demasiadas solicitudes');
            }
            
            throw new Error(`Color extraction failed: ${response.status} - ${errorDetails}`);
          }

          const data = await response.json();
          console.log('Color extraction response:', data);
          
          if (data.result && data.result.colors && data.result.colors.image_colors) {
            const colors: string[] = data.result.colors.image_colors.map((colorInfo: any) => 
              colorInfo.html_code as string
            );
            
            // Filtrar y retornar hasta 6 colores únicos
            const uniqueColors: string[] = [...new Set(colors)].slice(0, 6);
            console.log('✅ Successfully extracted colors from Imagga:', uniqueColors);
            return uniqueColors;
          }
          
          console.log('⚠️ No colors found in response, using fallback');
          return this.getFallbackPalette();
        });
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
      console.log('🔄 Using fallback palette due to API error');
      return this.getFallbackPalette();
    }
  }

  // Método principal: subir imagen y extraer colores en un solo paso
  async generatePaletteFromImage(imageUri: string): Promise<string[]> {
    try {
      console.log('🎨 Starting Imagga color extraction for:', imageUri);
      
      // Verificar estado de la API primero (solo en móvil para evitar CORS en web)
      if (Platform?.OS !== 'web') {
        const apiStatus = await this.checkAPIStatus();
        if (!apiStatus.isWorking) {
          console.log('⚠️ API not working, using fallback:', apiStatus.error);
          return this.getFallbackPalette();
        }
        console.log('✅ API is working, proceeding with extraction');
      }
      
      // Paso 1: Subir imagen
      const uploadId = await this.uploadImage(imageUri);
      
      if (!uploadId) {
        console.log('📤 Upload failed, using fallback palette');
        return this.getFallbackPalette();
      }

      // Paso 2: Extraer colores
      const colors = await this.extractColorsFromUploadId(uploadId);
      
      return colors;
      
    } catch (error) {
      console.error('❌ Error in generatePaletteFromImage:', error);
      console.log('🔄 Falling back to predefined palette');
      return this.getFallbackPalette();
    }
  }

  // Método alternativo usando URL de imagen directa
  async extractColorsFromImageUrl(imageUrl: string): Promise<string[]> {
    try {
      console.log('Extracting colors from URL:', imageUrl);
      
      return await this.queueRequest(async () => {
        return await this.retryWithBackoff(async () => {
          const response = await fetch(
            `${this.BASE_URL}/colors?image_url=${encodeURIComponent(imageUrl)}&extract_object_colors=0&extract_overall_colors=1&overall_count=6`,
            {
              method: 'GET',
              headers: {
                'Authorization': this.getAuthHeader(),
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Color extraction failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          
          if (data.result && data.result.colors && data.result.colors.image_colors) {
            const colors: string[] = data.result.colors.image_colors.map((colorInfo: any) => 
              colorInfo.html_code as string
            );
            
            const uniqueColors: string[] = [...new Set(colors)].slice(0, 6);
            return uniqueColors;
          }
          
          return this.getFallbackPalette();
        });
      });
    } catch (error) {
      console.error('Error extracting colors from URL:', error);
      return this.getFallbackPalette();
    }
  }

  // Paletas de respaldo en caso de error
  private getFallbackPalette(): string[] {
    const palettes = [
      ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
      ['#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'],
      ['#FF6348', '#FF4757', '#747D8C', '#A4B0BE', '#57606F'],
      ['#2ED573', '#FFA502', '#FF6348', '#FF4757', '#5352ED'],
      ['#70A1FF', '#5352ED', '#FF4757', '#FF6348', '#2ED573'],
    ];
    
    const randomIndex = Math.floor(Math.random() * palettes.length);
    return palettes[randomIndex];
  }

  // Método para generar paletas aleatorias (mantener compatibilidad)
  async generateRandomPalette(): Promise<string[]> {
    // Para paletas aleatorias, usamos las de fallback
    return this.getFallbackPalette();
  }
}

export default new ImaggaAPIService();
