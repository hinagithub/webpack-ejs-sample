const path = require('path');
const CopyFilePlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = [
  {
    mode: 'production', // productionかdevelopmentを設定
    entry: ['./public/js/main.js', './public/css/style.css'], // ビルド元のファイル
    output: {
      path: path.resolve(__dirname, 'dist/public/js'), // ビルド後のファイル
      filename: '[name].js', // [name]はjsファイルの元の名前になる(ここではmain.js)
    },
    module: {
      rules: [
        {
          test: /\.js?$/, // 対象ファイル名のパターン
          exclude: /(node_modules)/, // 除外ファイルの場所
          include: path.resolve(__dirname, 'src'), // 対象ファイルの場所
          use: {
            loader: 'babel-loader', // トランスパイルのためのloader
            options: {
              presets: ['@babel/preset-env'], // EC6をES5にしている
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            'style-loader', // jsに取り込まれたcssをDOMに取り込むloader
            {
              loader: 'css-loader', //cssをjsファイルに取り込むloader
              options: { url: false, sourceMap: true }, // sourceMap=trueで開発者ツールからCSSを追えるようにする(本番環境ではfalseにすべき)
            },
          ],
        },
      ],
    },
    target: ['web', 'es5'], // IE11以前に対応する
    plugins: [
      //ファイルをコピーするplugin
      new CopyFilePlugin({
        patterns: [
          {
            context: 'views', // コピー元ディレクトリ名
            from: 'index.ejs', //コピー元ファイル名
            to: __dirname + '/dist/views/index.ejs', //コピー先ディレクトリ名 & ファイル名
          },
          {
            context: 'public',
            from: 'images',
            to: __dirname + '/dist/public/images',
          },
        ],
      }),
      new WriteFilePlugin(), // コピーしたファイルをペーストするplugin
    ],
  },
];
