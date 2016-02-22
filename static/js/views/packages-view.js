var middguard = middguard || {};

(function () {
  'use strict';

  middguard.PackagesView = Backbone.View.extend({
    id: 'middguard-packages',
    template: _.template(
      '<div id="middguard-packages-list">' +
        '<h3>Modules</h3><div id="middguard-packages-modules"></div>' +
        '<h3>Models</h3><div id="middguard-packages-models"></div>' +
        '<h3>Analytics</h3><div id="middguard-packages-analytics"></div>' +
      '</div>'
    ),
    initialize: function () {
      _.bindAll(this,
        'addAllModules',
        'addAllModels',
        'addAllAnalytics',
        'addAll');

      this.listenTo(middguard.PackagedModules, 'reset', this.addAllModules);
      this.listenTo(middguard.PackagedModels, 'reset', this.addAllModels);
      this.listenTo(middguard.PackagedAnalytics, 'reset', this.addAllAnalytics);

      this.listenTo(middguard.PackagedModels, 'reset', this.createCollections);

      middguard.PackagedModules.fetch({reset: true});
      middguard.PackagedModels.fetch({reset: true});
      middguard.PackagedAnalytics.fetch({reset: true});
    },
    render: function () {
      this.$el.html(this.template());
      this.$modules = this.$('#middguard-packages-modules');
      this.$models = this.$('#middguard-packages-models');
      this.$analytics = this.$('#middguard-packages-analytics');
      var sWidth = screen.width;
      $('body').append('<div id="modules-container"/>');
      return this;
    },
    addAllModules: function () {
      this.addAll(middguard.PackagedModules, 'module', this.$modules);
    },
    addAllModels: function () {
      this.addAll(middguard.PackagedModels, 'model', this.$models);
    },
    addAllAnalytics: function () {
      this.addAll(middguard.PackagedAnalytics, 'analytics', this.$analytics);
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
