module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Removed reanimated plugin temporarily to isolate the crash
    plugins: [], 
  };
};
