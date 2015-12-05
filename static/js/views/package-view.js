var middguard = middguard || {};

(function () {
  'use strict';

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
      this.maxModHeight = 0;
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
      // TODO: split this out into two functions based on target's class
      if (this.type !== 'module' && this.type !== 'model') return;
      if (this.type === 'module') {
        if (this.active) {
          // var viewMain = this.model.get('main');
          // console.log('About to remove view "' + viewMain + '".');
          //
          // // For each model this view references
          // middguard.__modules[viewMain].live.middguard_entities.forEach(function (entityName) {
          //   var collection = middguard.entities[entityName];
          //
          //   // First iteration to remove reference to this model
          //   collection.each(function (model, i) {
          //     if (model.get('middguard_views').indexOf(viewMain) > -1) {
          //       removeFromArray(model.get('middguard_views'), viewMain);
          //     }
          //   });
          //
          //   // Get an array of models from this entity collection to remove
          //   var toRemove = collection.filter(function (model) {
          //     if (model.get('middguard_views').length === 0) {
          //       return true;
          //     }
          //   });
          //
          //   console.log('Removing ' + toRemove.length +
          //               ' models that are no longer in use from collection "' +
          //               entityName +'".');
          //   // remove them without sending anything to the server
          //   collection.remove(toRemove, {silent: true});
          // });

          // remove the view
          middguard.__modules[this.model.get('main')].live.remove();
          middguard.__modules[this.model.get('main')].live = null;
        } else {
          var module = new middguard.__modules[this.model.get('main')].ctor;
          middguard.__modules[this.model.get('main')].live = module;
          $('#modules-container').append(module.render().el);
          var curWidth = parseFloat($('#modules-container').css('width'));
          $('#modules-container').css('width', curWidth + parseFloat(module.$el.css('width')));
          if (parseFloat(module.$el.css('height')) > this.maxModHeight) this.maxModHeight = parseFloat(module.$el.css('height'));
          //$('middguard-header').css('height', $(document).height());
        }
        this.active = !this.active;
        this.render();
        $('middguard-header').css('height', $(document).height());
      } else {
        //if this.type === model
        if (this.active) {
          $('#sql-model-view-' + this.model.get('name')).remove();
        } else {
          var module = new middguard.SQLView.ctor({model: this.model});
          $('#modules-container').append(module.render().el);
          var curWidth = parseFloat($('#modules-container').css('width'));
          $('#modules-container').css('width', curWidth + parseFloat(module.$el.css('width')));
          if (parseFloat(module.$el.css('height')) > this.maxModHeight) this.maxModHeight = parseFloat(module.$el.css('height'));
          $('middguard-header').css('height', this.maxModHeight);
        }
        this.active = !this.active;
        this.$el.toggleClass('active', this.active);
        this.render();
        $('middguard-header').css('height', $(document).height());
      }
    }
  });
})();
