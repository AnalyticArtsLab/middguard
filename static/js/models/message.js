var middguard = middguard || {};

(function () {
  middguard.Message = Backbone.Model.extend({
    defaults: {
      analyst: '',
      state: '',
      content: '',
      seen: false,
      timestamp: Date.now()
    }
  });
})();