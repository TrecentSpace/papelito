/**
 * Configuración temporal para AI Gateway
 * 
 * Esta es una solución temporal mientras se resuelve el problema de caché de Expo.
 * 
 * INSTRUCCIONES:
 * 1. Abre tu archivo .env
 * 2. Copia el valor de AI_GATEWAY_API_KEY
 * 3. Pégala abajo reemplazando 'TU_API_KEY_AQUI'
 * 4. Guarda el archivo
 * 
 * IMPORTANTE: Esta es una solución temporal. Una vez que Expo lea correctamente
 * el .env, esta configuración será ignorada.
 */

// SOLUCIÓN TEMPORAL: Pega tu API key aquí directamente
const TEMP_API_KEY = 'TU_API_KEY_AQUI';

// Intentar leer desde expo-constants primero (configuración normal)
import Constants from 'expo-constants';
const configApiKey = Constants.expoConfig?.extra?.aiGatewayApiKey || '';

// Usar la key de expo-constants si está disponible, sino usar la temporal
export const AI_GATEWAY_API_KEY = configApiKey || TEMP_API_KEY;

// Verificar si está configurada
export const isConfigured = () => {
  const key = AI_GATEWAY_API_KEY;
  const isSet = key && key.trim().length > 0 && key !== 'TU_API_KEY_AQUI';
  
  if (!isSet) {
    console.warn('⚠️ AI Gateway API Key no configurada.');
    console.warn('📝 SOLUCIÓN TEMPORAL:');
    console.warn('   1. Abre: config/aiGatewayConfig.ts');
    console.warn('   2. Reemplaza "TU_API_KEY_AQUI" con tu API key real');
    console.warn('   3. Guarda el archivo y reinicia la app');
  }
  
  return isSet;
};
