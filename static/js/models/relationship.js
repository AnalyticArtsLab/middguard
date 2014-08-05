var middguard = middguard || {};

(function () {
  middguard.Relationship = Backbone.Model.extend({
    defaults: {
      id_1: '',
      id_2: '',
      type_1: '',
      type_2: ''
    }
  });
})();