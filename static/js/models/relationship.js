var middguard = middguard || {};

(function () {
  middguard.Relationship = Backbone.Model.extend({
    defaults: {
      id_1: '',
      id_2: '',
      type_1: '',
      type_2: ''
    },
    modelOne: function () {
      var type = this.get('type_1');
      var id = +this.get('id_1');

      return middguard.entities[capitalize(pluralize(type))].get(id);
    },
    modelTwo: function () {
      var type = this.get('type_2');
      var id = +this.get('id_2');

      return middguard.entities[capitalize(pluralize(type))].get(id);
    }
  });
})();