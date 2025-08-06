module.exports = {
  plugins: {
    // Fixes flexbox bugs in older browsers
    'postcss-flexbugs-fixes': {},
    
    // Modern CSS features with automatic browser support
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
  },
}