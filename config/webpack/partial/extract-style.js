"use strict";

const archetype = require("electrode-archetype-react-app/config/archetype");
const Path = require("path");
const webpack = require("webpack");
const glob = require("glob");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CSSSplitPlugin = require("css-split-webpack-plugin").default;

const atImport = require("postcss-import");
const cssnext = require("postcss-cssnext");

const autoprefixer = require("autoprefixer-stylus");
const cssLoader = require.resolve("css-loader");
const styleLoader = require.resolve("style-loader");
const stylusLoader = require.resolve("stylus-relative-loader");
const postcssLoader = require.resolve("postcss-loader");

const AppMode = archetype.AppMode;

/**
 * [cssModuleSupport By default, this archetype assumes you are using CSS-Modules + CSS-Next]
 *
 * Stylus is also supported for which the following cases can occur.
 *
 * case 1: *only* *.css exists => CSS-Modules + CSS-Next
 * case 2: *only* *.styl exists => stylus
 * case 3: *both* *.css & *.styl exists => CSS-Modules + CSS-Next takes priority
 *          with a warning message
 * case 4: *none* *.css & *.styl exists => CSS-Modules + CSS-Next takes priority
 * case 5: *cssModuleStylusSupport* config is true => Use both Stylus and CSS Modules
 */

const cssNextExists = (glob.sync(Path.resolve(AppMode.src.client, "**", "*.css")).length > 0);
const stylusExists = (glob.sync(Path.resolve(AppMode.src.client, "**", "*.styl")).length > 0);

// By default, this archetype assumes you are using CSS-Modules + CSS-Next
const cssModuleSupport = stylusExists && !cssNextExists;

module.exports = function () {
  const cssModuleStylusSupport = archetype.webpack.cssModuleStylusSupport;
  const stylusQuery = cssLoader + "?-autoprefixer!" + stylusLoader;
  const cssQuery = cssLoader + "?modules&localIdentName=[name]__[local]___[hash:base64:5]&-autoprefixer!" + postcssLoader;
  const cssStylusQuery = cssLoader + "?modules&localIdentName=[name]__[local]___[hash:base64:5]&-autoprefixer!" + postcssLoader + "!" + stylusLoader;

  // By default, this archetype assumes you are using CSS-Modules + CSS-Next
  const rules = [{
    _name: "extract-css",
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({ fallback: styleLoader, use: cssQuery, publicPath: "" })
  }];

  rules.push({
    test: /main\.scss$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'sass-loader'],
    }),
  });

  if (cssModuleStylusSupport) {
    rules.push({
      _name: "extract-css-stylus",
      test: /\.styl$/,
      use: ExtractTextPlugin.extract({ fallback: styleLoader, use: cssStylusQuery, publicPath: "" })
    });
  } else if (!cssModuleSupport) {
    rules.push({
      _name: "extract-stylus",
      test: /\.styl$/,
      use: ExtractTextPlugin.extract({ fallback: styleLoader, use: stylusQuery, publicPath: "" })
    });
  }

  if (cssModuleSupport) {
    rules.push({
      _name: "postcss",
      test: /((?!main).{4})\.scss$/,
      use: [
        {
          loader: "postcss-loader",
          options: {
            browsers: ["last 2 versions", "ie >= 9", "> 5%"]
          }
        }
      ]
    });
  }

  return {
    module: { rules },
    plugins: [
      new ExtractTextPlugin({ filename: "[name].style.[hash].css" }),

      /*
       preserve: default: false. Keep the original unsplit file as well.
       Sometimes this is desirable if you want to target a specific browser (IE)
       with the split files and then serve the unsplit ones to everyone else.
       */
      new CSSSplitPlugin({ size: 4000, imports: true, preserve: true }),
      new webpack.LoaderOptionsPlugin({
        options: {
          context: Path.resolve(process.cwd(), "client"),
          postcss: () => {
            return cssModuleSupport ? [atImport, cssnext({
              browsers: ["last 2 versions", "ie >= 9", "> 5%"]
            })] : [];
          },
          stylus: {
            use: () => {
              return !cssModuleSupport ? [autoprefixer({
                browsers: ["last 2 versions", "ie >= 9", "> 5%"]
              })] : [];
            }
          }
        }
      })
    ]
  };
};
