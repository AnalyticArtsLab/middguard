var middguard = middguard || {};

(function () {
  'use strict';

  middguard.PackagesView = Backbone.View.extend({
    id: 'middguard-packages',
    template: _.template(
      '<h2 id="middguard-packages-header">Modules</h2>' +
      '<div id="middguard-packages-list">' +
        '<div id="middguard-packages-modules"></div>' +
      '</div>'
    ),
    initialize: function () {
      _.bindAll(this, 'addOne', 'addAll');

      this.listenTo(middguard.Modules, 'reset', this.addAll);

      middguard.Modules.fetch({reset: true});
    },
    render: function () {
      this.$el.html(this.template());
      this.$modules = this.$('#middguard-packages-modules');
      return this;
    },
    addOne: function (model) {
      var view = new middguard.PackageView({model: model});
      this.$modules.append(view.render().el);
    },
    addAll: function () {
      middguard.Modules.each(this.addOne);
    }
  });

  middguard.PackageView = Backbone.View.extend({
    className: 'middguard-package',
    template: _.template(
      '<div class="middguard-package-name"><%= name %></div>'
    ),
    events: {
      'click': 'toggleActive'
    },
    initialize: function () {
      this.active = false;

      _.bindAll(this, 'toggleActive');
    },
    render: function () {
      this.$el.html(this.template({name: this.model.get('name')}));
      this.$el.toggleClass('active', this.active);
      return this;
    },
    toggleActive: function () {
      if (this.active) {
        middguard.__modules[this.model.get('main')].live.remove();
        middguard.__modules[this.model.get('main')].live = null;
      } else {
        var module = new middguard.__modules[this.model.get('main')].ctor;
        middguard.__modules[this.model.get('main')].live = module;
        $('body').append(module.render().el);
      }
      this.active = !this.active;
      this.render();
    }
  })
})();