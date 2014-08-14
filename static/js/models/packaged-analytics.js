var middguard = middguard || {};

(function () {
  middguard.PackagedAnalyticsModel = Backbone.Model.extend({
    defaults: {
      name: '',
      requirePath: ''
    }
  });
})();