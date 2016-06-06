var middguard = middguard || {};

(function() {
  var PackagedModels = Backbone.Collection.extend({
    url: 'models',
    model: middguard.PackagedModel
  });

  middguard.PackagedModels = new PackagedModels();
})();
