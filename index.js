module.exports = process.env.PATHMATCHER_COV
  ? require('./lib-cov/pathmatcher')
  : require('./lib/pathmatcher');