const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// ---- SAFE EXTENSIONS ONLY ----

// Add monorepo root WITHOUT removing Expo defaults
config.watchFolders = [
	...config.watchFolders,
	path.resolve(__dirname, "../../"),
];

// Add extra node_modules lookup paths
config.resolver.nodeModulesPaths = [
	...config.resolver.nodeModulesPaths,
	path.resolve(__dirname, "../../node_modules"),
];

// ---- DO NOT OVERWRITE ANYTHING ELSE ----

module.exports = config;
