const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para resolver el problema de expo-sqlite en web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Excluir archivos problemáticos de expo-sqlite en web
config.resolver.blacklistRE = /.*\/node_modules\/expo-sqlite\/web\/.*\.ts$/;

// Configuración adicional para evitar problemas con archivos .wasm
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
