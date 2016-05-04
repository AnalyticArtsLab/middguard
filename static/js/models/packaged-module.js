var middguard = middguard || {};

(function () {
  middguard.PackagedModule = Backbone.Model.extend({
    defaults: {
      'name': '',
      'main': '',
      visualization: false
    }
  });
})();
