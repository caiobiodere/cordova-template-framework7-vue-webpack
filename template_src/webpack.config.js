module.exports = function (env) {
  if (typeof env === 'undefined' || typeof env.devserver === 'undefined') {
    return require('./webpack.config.dev');
  } else if (typeof env.devserver !== 'undefined' && env.devserver) {
    return require('./webpack.config.server');
  } else if (typeof env.release !== 'undefined' && env.release) { 
    return require('./webpack.config.release');
  }
}