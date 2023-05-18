/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const ExtensionReloader = require('webpack-extension-reloader-v3-manifest');
const { version } = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    'chessable/background': './chessable/background.ts',
    'chessable/chessable': './chessable/chessable.ts',
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    alias: {
      '@': __dirname + '/src',
    },
    extensions: ['.ts', '.js'],
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.js|\.ts$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/images/',
          emitFile: true,
          esModule: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/fonts/',
          emitFile: true,
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin(
      {
          patterns: [{
            from: 'manifest.json',
            to: 'manifest.json',
            transform: content => {
              const jsonContent = JSON.parse(content);
              jsonContent.version = version;
              jsonContent.content_security_policy = {
                "extension_pages": "script-src 'self'; object-src 'self';",
              }

              return JSON.stringify(jsonContent, null, 2);
            },
          }]
      }
    ),
  ],
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: __dirname + '/src/manifest.json',
    }),
  ]);
}


module.exports = config;
