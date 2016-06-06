var middguard = middguard || {};

(function() {
  var PackagedModules = Backbone.Collection.extend({
    url: 'modules',
    model: middguard.PackagedModule
  });

  middguard.PackagedModules = new PackagedModules();
})();
