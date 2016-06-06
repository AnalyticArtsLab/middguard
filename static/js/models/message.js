var middguard = middguard || {};

(function() {
  middguard.Message = Backbone.Model.extend({
    defaults: {
      analyst_id: '',
      state: '',
      content: '',
      seen: false
    }
  });
})();
