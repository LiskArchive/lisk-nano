import webpack from 'webpack'
import merge from 'webpack-merge'
import validate from 'webpack-validator'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ngAnnotatePlugin from 'ng-annotate-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'

import path from 'path'
import ChunkManifestPlugin from 'chunk-manifest-webpack2-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import WebpackMd5Hash from 'webpack-md5-hash'

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.resolve(__dirname, '..', 'app')
}

const common = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    //filename: `app.js`,
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js'
  },
  node: {
    fs: 'empty'
  },
  resolve: {
    alias: {
      jquery: 'jquery/src/jquery'
    }
  },
  module: {
    loaders: [
        {
            test: /\.css$/,
            loader: 'style-loader'
        },
	    {
		    test: /\.css$/,
		    loader: 'css-loader'
	    },
	    {
		    test: /\.css$/,
		    loader: 'less-loader'
	    },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            include: PATHS.app,
        },
        {
            test: /\.pug$/,
            loader: 'pug-loader',
            include: PATHS.app,
        },
        {
            test: /\.less$/,
            //loader: 'style!css!less',
            loader: 'style-loader',
            include: PATHS.app,
        },
	    {
		    test: /\.less$/,
		    //loader: 'style!css!less',
		    loader: 'css-loader',
		    include: PATHS.app,
	    },
	    {
		    test: /\.less$/,
		    //loader: 'style!css!less',
		    loader: 'less-loader',
		    include: PATHS.app,
	    },
        {
            test: /\.png$/,
            loader: 'url-loader',
        },
        {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'url-loader',
            include: path.resolve(__dirname, PATHS.app, 'assets')
        },

    ]
  },

}

/*
PLUGINS
*/

let chunks = () => {
	return {
		plugins: [
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendor",
				minChunks: Infinity,
			}),
			new WebpackMd5Hash(),
			new ManifestPlugin(),
			new ChunkManifestPlugin({
				filename: "chunk-manifest.json",
				manifestVariable: "webpackManifest"
			}),
		]
	}
}

let clean = (path) => {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd()
      })
    ]
  }
}

let html = () => {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'app/index.pug',
        minify: {
          collapseWhitespace: true,
          minifyCSS: true,
        }
      })
    ]
  }
}

let minify = () => {
  return {
    plugins: [
      new ngAnnotatePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
        sourceMap: true,
      })
    ]
  }
}

let provide = () => {
	return {
		plugins: [
			new webpack.ProvidePlugin({
				app: 'exports-loader?exports.default!' + path.join(PATHS.app, 'app'),
			}),
		]
	}
}

/*
DEVSERVER
*/


let devServer = () => {
	return {
		devServer: {
			hot: true,
			inline: true,
			stats: 'errors-only',
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin({ multiStep: true })
		]
	}
}

let config

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,

      chunks(),
      clean(path.join(PATHS.build, '*')),
      minify(),

      html(),
      provide(),
    )
    break
  default:
    config = merge(
      common,
      devServer(),
      { devtool: 'eval-source-map' },

      html(),
      provide(),
    )
    break
}

export default validate(config)
