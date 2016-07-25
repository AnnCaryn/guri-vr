
var path = require('path');

var sharedConfig = {
  entry: path.join(__dirname, 'client', 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.js'
  },
  module: {
    loaders: [
      { loader: 'babel-loader', test: /\.js$/, exclude: /node_modules/ },
      { loader: 'json-loader', test: /\.json$/}
    ]
  },
  resolve: {
    root: [ path.resolve('./client/src') ],
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  plugins: []
};

module.exports = [
  sharedConfig,
  Object.assign({}, sharedConfig, {
    entry: path.join(__dirname, 'index.js'),
    output: {
      path: __dirname,
      filename: 'server.js'
    },
    target: 'node',
    module: Object.assign({}, sharedConfig.module, {}) 
  })
];

console.log(module.exports[1].module.loaders[0])
