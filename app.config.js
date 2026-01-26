const path = require('path');
const { config } = require('dotenv');

// Cargar variables de entorno desde .env
const result = config({ path: path.resolve(__dirname, '.env') });

// Debug: verificar si se cargó la variable
if (result.error) {
  console.warn('Error cargando .env:', result.error);
} else {
  console.log('Variables de entorno cargadas:', {
    hasApiKey: !!process.env.AI_GATEWAY_API_KEY,
    apiKeyLength: process.env.AI_GATEWAY_API_KEY?.length || 0,
  });
}

module.exports = {
  expo: {
    name: 'papelito',
    slug: 'papelito',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'papelito',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.georgeandrew.papelito',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'cecf9428-6507-4287-9b41-8d6099e6a452',
      },
      aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY || '',
    },
  },
};
