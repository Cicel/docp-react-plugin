const path = require('path');
const process = require('process');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {},
  output: {
    path: '/dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(process.cwd(), './node_modules')],
    alias: {
      '@': path.resolve(process.cwd())
    }
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  module: {
    rules: [
      {
        test: /\.js|.jsx$/,
        loaders: [{
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env'], ['@babel/preset-react']],
            plugins: ['@babel/plugin-syntax-jsx', '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-react-display-name']
          }
        }]
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new ProgressBarPlugin()
  ]
}