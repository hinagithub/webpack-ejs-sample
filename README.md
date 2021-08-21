## このプロジェクトについて
このプロジェクトは、ブログ記事「[【Node.js】webpackとejsを使ったときの設定](https://hinahinako.github.io/mypage/2021/08/21/Node.js-webpack%E3%81%A8ejs%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E3%81%A8%E3%81%8D%E3%81%AE%E8%A8%AD%E5%AE%9A.html)」の説明に使用したサンプルです。
<br/>
以下、ブログの内容。

## 概要
ExpressのEJSとwebpackを使って画面を開発するなかで、webpackの設定を調べたのでメモ。

<br />

ビルド時のポイントは3つ
1. ES5にトランスパイルする
2. cssはjsファイルに取り込む
3. 画像ファイルと.ejsファイルをbuild後のディレクトリにコピーする

<br />


3は、EJSファイルをビルド後のディレクトリに移したい事情がある場合(Typescriptを使用するなど)に役立つ(かも)。

## サンプルプロジェクト
- 置き場所
[webpack-ejs-sample](https://github.com/hinahinako/webpack-ejs-sample)

- 構成

```
- myapp
  - dist
  - node_modules
  - public
    - css
      - style.css
    - images
      - sky_blue.png
    - js
      - main.js
  - server.js
  - views
    - index.ejs
  - webpack.config.js
  - package.json
  - package-lock.json
```

## server.jsの設定

```js
var express = require('express');
var path = require('path');
var app = express();

app.set('views', path.join(__dirname, 'dist/views'));
app.set('view engine', 'ejs');
app.use(express.static('dist/public'));
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.render('./index.ejs');
});

app.listen(3000);
```

### 解説

```js
app.set('views', path.join(__dirname, 'dist/views'));
app.use(express.static('dist/public'));
```
ここで使用するEJSの置き場所と静的ファイルの置き場所を指定する。
ビルド後のファイルは/publicではなく/dist/publicにしている。

## webpackの設定

```js
const path = require('path');
const CopyFilePlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = [
  {
    mode: 'production',
    entry: ['./public/js/main.js', './public/css/style.css'],
    output: {
      path: path.resolve(__dirname, 'dist/public/js'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /(node_modules)/,
          include: path.resolve(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { url: false, sourceMap: true },
            },
          ],
        },
      ],
    },
    target: ['web', 'es5'],
    plugins: [
      new CopyFilePlugin({
        patterns: [
          {
            context: 'views',
            from: 'index.ejs',
            to: __dirname + '/dist/views/index.ejs',
          },
          {
            context: 'public',
            from: 'images',
            to: __dirname + '/dist/public/images',
          },
        ],
      }),
      new WriteFilePlugin(),
    ],
  },
];

```


### 解説

- mode: `public`か`development`のどちらかを設定する。アプリケーション実行時に `--env `で指定すると、対象のmodeに書かれたwebpackが実行される。 `none`にもできるらしいが、実行時に`--env` で指定すると警告がでる。

- entry: ビルド元にあるファイルの場所
- output: ビルド先のファイルの場所。filenameは `[name]`とすると、jsファイルのファイル名が代入される。
- module.rules: トランスパイルなどのビルドを適応するファイル名のパターンを設定する。(loaderはソースコードを変換したりモジュール化するためのツール)
- 以下は.jsファイルに対して、ES6の構文をES5にトランスパイルする設定

```js
  {
    test: /\.js?$/,
    exclude: /(node_modules)/,
    include: path.resolve(__dirname, 'src'),
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  },
```
- 以下はcssをmain.jsファイルに組み込む設定

```js
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { url: false, sourceMap: true },
            },
          ],
        },
```

- target: ['web', 'es5']: IE11以下のブラウザにも対応した構文にする設定
- plugins: バンドルの最適化や資産管理を書くところ。ここでは`copy-webpack-plugin`を使ってEJSファイルと画像ファイルをdist配下にコピペするよう設定している


## build後のディレクトリ構成
dist配下にビルドされたファイルが格納されている。
CSSはjsファイルに取り込まれるので、/dist/css/style.cssは存在しない。

```
- myapp
  - dist
    - public
      - images
        - sky_blue.png
      - js
        - main.js
      - views
        - index.ejs
  - node_modules
  - public
    - css
      - style.css
    - images
      - sky_blue.png
    - js
      - main.js
  - server.js
  - views
    - index.ejs
  - webpack.config.js
  - package.json
  - package-lock.json
```

## 参考

- [css-loader と style-loaderを間違えない ~css-loaderを使わずにcssを使ってみる~](https://blog.ojisan.io/css-loader-style-loader)
- [最新版で学ぶwebpack 5入門 スタイルシート(CSS/Sass)を取り込む方法](https://ics.media/entry/17376/)
- [Webpackで静的なファイルをコピーする方法](https://www.kalium.net/image/2019/10/30/webpack%E3%81%A7%E9%9D%99%E7%9A%84%E3%81%AA%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E3%82%B3%E3%83%94%E3%83%BC%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95/)
- [最新版で学ぶwebpack 5入門 Babel 7でES2020環境の構築](https://ics.media/entry/16028/)

以上

