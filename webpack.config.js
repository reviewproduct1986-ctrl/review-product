const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'ProductOpinion - Get Expert Product Reviews & Opinions',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'], // HtmlWebpackPlugin handles index.html
          },
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        // Separate React libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          reuseExistingChunk: true,
        },
        // React Router in separate chunk
        router: {
          test: /[\\/]node_modules[\\/]react-router-dom[\\/]/,
          name: 'router',
          priority: 19,
          reuseExistingChunk: true,
        },
        // React Markdown (only loads with ReviewPage)
        markdown: {
          test: /[\\/]node_modules[\\/]react-markdown[\\/]/,
          name: 'markdown',
          priority: 18,
          reuseExistingChunk: true,
        },
        // Lucide icons
        icons: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'icons',
          priority: 17,
          reuseExistingChunk: true,
        },
        // Other vendor code
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Common code used in multiple places
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    // Minimize bundle size in production
    minimize: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 244000, // 244 KB (default is too high)
    maxEntrypointSize: 244000,
    assetFilter: function(assetFilename) {
      // Don't show warnings for these files
      return !assetFilename.endsWith('.map') && 
             !assetFilename.endsWith('.json') &&
             !/\.(png|jpg|jpeg|gif|svg|webp)$/.test(assetFilename);
    },
  }
};