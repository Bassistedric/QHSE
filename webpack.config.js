const path = require('path');

module.exports = {
  // Keep bundle output deterministic and multi-line so Git merges are less conflict-prone.
  // Minified one-line assets were creating frequent full-file conflicts on PRs.
  mode: 'none',
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        },
        type: 'javascript/esm'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
