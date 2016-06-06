var middguard = middguard || {};

(function() {
  middguard.entities = {};

  middguard.EntityCollection = Backbone.Collection.extend({
    initialize: function(models, options) {
      this.url = _.result(options, 'url');

      _.bindAll(this, 'serverCreate', 'serverUpdate', 'serverDelete');
      this.ioBind('create', this.serverCreate, this);
      this.ioBind('update', this.serverUpdate, this);
      this.ioBind('delete', this.serverDelete, this);

      this.listenTo(this, 'sync', this.addViewReferences);
    },
    serverCreate: function(data) {
      var exists = this.get(data.id);
      if (!exists) {
        this.add(data);
      } else {
        exists.set(data);
      }
    },
    serverUpdate: function(data) {
      var exists = this.get(data.id);
      if (exists) {
        exists.set(data);
      }
    },
    serverDelete: function(data) {
      // Already deleted from database, so don't need to model.destroy
      var exists = this.get(data.id);
      if (exists) {
        this.remove(exists);
      }
    },
    addViewReferences: function(collection, response, options) {
      var middguard_view_name = options.middguard_view_name;

      // if a view name wasn't passed in we can't do anything about it
      if (!middguard_view_name) {
        return;
      }

      console.log('Adding view references for view "' + middguard_view_name +
                  '" to ' + response.length + ' fetched models.');

      // get models added to the collection that match the criteria
      // we fetched for
      (options.data ? collection.where(options.data) : collection)
      .forEach(function(model) {
        var currentViews = model.get('middguard_views');

        // if 'middguard_views' doesn't exist on the model, set it to an empty
        // array
        if (!currentViews) {
          model.set('middguard_views', []);
        }

        currentViews = model.get('middguard_views');

        // if the view has already been added
        if (currentViews.indexOf(options.middguard_view_name) > -1) {
          return;
        }

        // add the view to the model's 'middguard_views'
        currentViews.push(middguard_view_name);
        model.set('middguard_views', currentViews);
      });
    }
  });
})();
