var root = require('../config').settings.root;

/**
 * Discovers and returns paths to all js and css files to be loaded.
 *
 * @return { 'js': string[], 'css': string[] }
 */

module.exports = function() {
  var modules = {
    js: [],
    css: []
  };
  return modules;
};