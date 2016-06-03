var middguard = middguard || {};

(function () {
  'use strict';

  middguard.PackagesView = Backbone.View.extend({
    id: 'middguard-packages',
    template: _.template(
      '<div id="middguard-packages-list">' +
        '<h3>Graphs</h3><div id="middguard-graphs"></div>' +
        '<h3>Modules</h3><div id="middguard-modules"></div>' +
      '</div>'
    ),
    initialize: function () {
      this.listenTo(middguard.Graphs, 'reset', this.addAllGraphs);

      middguard.Graphs.fetch({reset: true});
    },
    render: function () {
      this.$el.html(this.template());
      this.$modules = this.$('#middguard-modules');
      this.$graphs = this.$('#middguard-graphs');

      $('body').append('<div id="modules-container"/>');
      return this;
    },
    addAllModules: function () {
      this.addAll(middguard.Modules, 'module', this.$modules);
    },
    addAllGraphs: function () {
      this.addAll(middguard.Graphs, 'graph', this.$analytics);
    },
    addAll: function (collection, type, container) {
      collection.each(_.bind(function (model) {
        var view = new middguard.PackageView({model: model}, {type: type});
        container.append(view.render().el);
      }, this));
    },
    createCollections: function () {
      middguard.PackagedModels.each(function (model) {
        var name = model.get('name');
        var capital = capitalize(name);
        var plural = pluralize(name);
        var capitalPlural = capitalize(plural);

        middguard.entities[capital] = Backbone.Model.extend({
          url: name
        });
        middguard.entities[capitalPlural] = new middguard.EntityCollection([], {
          url: plural,
          model: middguard.entities[capital]
        });

        middguard.state[capitalPlural] = {selections: new Backbone.Collection(),
																					workingSet: new Backbone.Collection()};
				_.extend(middguard.state[capitalPlural], Backbone.Events);

				//here each entityCollection, which is a Backbone collection, adds the appropriate models to itself
        //if its name is not contained in the customLoads variable
      });
    }
  });

  var capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
})();
