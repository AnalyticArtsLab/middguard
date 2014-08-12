var middguard = middguard || {};

(function () {
  var Modules = Backbone.Collection.extend({
    url: 'modules',
    module: middguard.Module
  });

  middguard.Modules = new Modules();
})();