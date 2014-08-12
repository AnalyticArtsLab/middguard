var middguard = middguard || {};

(function () {
  middguard.Module = Backbone.Model.extend({
    defaults: {
      'name': '',
      'main': ''
    }
  });
})();