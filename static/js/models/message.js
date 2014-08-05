var middguard = middguard || {};

(function () {
  middguard.Message = Backbone.Model.extend({
    defaults: {
      analyst: '',
      state: '',
      content: '',
      timestamp: Date.now()
    }
  });
})();