var modulesLoader = require('../loaders/modules_loader');

exports.readAll = function (data, callback) {
  var hostString = this.handshake.headers.host;
  var hostIndex = this.handshake.headers.referer.search(hostString);
  var url = this.handshake.headers.referer.slice(hostIndex+hostString.length);
  modulesLoader(url, function (modules) {
    callback(null, modules.names);
  });
};