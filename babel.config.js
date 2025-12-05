module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Note: reanimated plugin removed - not needed for basic navigation
    // Add it back only if you need complex animations
  };
};
