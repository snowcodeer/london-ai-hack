export default {
  expo: {
    name: 'SquareDeal',
    slug: 'square-deal',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.squaredeal.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      valyuApiKey: process.env.EXPO_PUBLIC_VALYU_API_KEY,
    },
  },
};
