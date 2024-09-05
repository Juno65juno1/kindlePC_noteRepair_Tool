const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
          // use: ["raw-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "body",
        minify: isProduction
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
            }
          : false,
      }),
      ...(isProduction
        ? [new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/bundle/])]
        : []),
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, "src"),
      },
      compress: true,
      port: 9000,
      hot: true,
    },
    devtool: isProduction ? false : "eval-source-map",
  };
};
