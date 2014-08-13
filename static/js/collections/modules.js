var middguard = middguard || {};

(function () {
  var Modules = Backbone.Collection.extend({
    url: 'modules',
    model: middguard.Module
  });

  middguard.Modules = new Modules();
})();