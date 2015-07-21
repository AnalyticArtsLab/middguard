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

      middguard.Relationships.fetch();
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

        middguard.entities[capital] = Backbone.Model.extend({url:name});
        middguard.entities[capitalPlural] = new middguard.EntityCollection([], {
          url: plural,
          model: middguard.entities[capital]
        });
				
        middguard.state[capitalPlural] = {selections: new Backbone.Collection(),
																					workingSet: new Backbone.Collection()};
				_.extend(middguard.state[capitalPlural], Backbone.Events);
				
				//here each entityCollection, which is a Backbone collection, adds the appropriate models to itself
        //if its name is not contained in the customLoads variable
    
        if (!model.get('customLoad')){
          middguard.entities[capitalPlural].fetch();
        }
      });
    }
  });

  var capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  middguard.PackageView = Backbone.View.extend({
    className: 'middguard-package',
    template: _.template(
      '<div class="middguard-package-name"><%= name %></div>'
    ),
    events: {
      'click': 'toggleActive'
    },
    initialize: function (model, options) {
      this.active = false;

      this.type = _.result(options, 'type');

      _.bindAll(this, 'toggleActive');
      if (this.type === 'model' && ! middguard.state.activeModel){
        middguard.state.activeModel = {};
        _.extend(middguard.state.activeModel, Backbone.Events);
        middguard.state.activeModel.current = this;
      }
    },
    render: function () {
      this.$el.html(this.template({name: this.model.get('name')}));
      this.$el.toggleClass('active', this.active);
      this.$el.addClass(this.type);
      return this;
    },
    toggleActive: function () {
      if (this.type !== 'module' && this.type !== 'model') return;
      if (this.type === 'module'){
        if (this.active) {
          middguard.__modules[this.model.get('main')].live.remove();
          middguard.__modules[this.model.get('main')].live = null;
        } else {
          var module = new middguard.__modules[this.model.get('main')].ctor;
          middguard.__modules[this.model.get('main')].live = module;
          $('#modules-container').append(module.render().el);
        }
        this.active = !this.active;
        this.render();
      } else {
        //if this.type === model
        if (this.active) {
          $('#sql-model-view-' + this.model.get('name')).remove();
        } else {
          var module = new middguard.SQLView.ctor({model: this.model});
          $('#modules-container').append(module.render().el);
        }
        this.active = !this.active;
        this.$el.toggleClass('active', this.active);
      }
    }
  });
})();