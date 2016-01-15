var middguard = middguard || {};

(function () {
  middguard.PackagedModel = Backbone.Model.extend({
    defaults: {
      name: '',
      requirePath: ''
    }
  });
})();
