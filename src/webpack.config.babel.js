
import webpack from 'webpack'
import merge from 'webpack-merge'
import validate from 'webpack-validator'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ngAnnotatePlugin from 'ng-annotate-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'

import path from 'path'
import ManifestPlugin from 'webpack-manifest-plugin'
import WebpackMd5Hash from 'webpack-md5-hash'
import BundleAnalyzerPlugin from 'webpack-bundle-analyzer'

var nodeEnvironment = process.env.NODE_ENV;

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.resolve(__dirname, '..', 'app')
}

const common = {
  entry: nodeEnvironment == 'test' ? { } : {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    //filename: `app.js`,
    filename: 'app.js',
    publicPath: '../app/',
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
	plugins: [
		new ngAnnotatePlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			sourceMap: true,
		}),
		new webpack.ProvidePlugin({
			app: 'exports-loader?exports.default!' + path.join(PATHS.app, 'app'),
		}),
		new BundleAnalyzerPlugin.BundleAnalyzerPlugin({
			analyzerMode: 'static'
		}),
	]

}

/*
PLUGINS
*/

let chunks = () => {
	return {
		plugins: [
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendor",
				filename: 'distApp.js',
				minChunks(module, count) {
					var context = module.context;
					return context && (context.indexOf('node_modules') >= 0 || context.indexOf('fonts') >= 0);
				},
			}),
			new WebpackMd5Hash(),
			new ManifestPlugin(),
		]
	}
}

let clean = (path) => {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd(),
        verbose: true,
        dry: false
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

    )
    break
  default:
    config = merge(
      common,
      devServer(),
      { devtool: 'eval-source-map' },

    )
    break
}

//export default validate(config)
module.exports = validate(config);
