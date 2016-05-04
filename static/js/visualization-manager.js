var middguard = middguard || {};

(function() {

  middguard.View = Backbone.View.extend({
    className: 'middguard-module',
    fetch: function (collection, options) {
      // set the view name to add to the middguard_views when we create/update
      // the models
      options.middguard_view_name = this.cid;

      // add the entity to this view
      // so we can check the entities and remove the view from middguard_views
      // when the view is destroyed
      if (this.middguard_entities.indexOf(collection) < 0) {
        this.middguard_entities.push(collection);
      }

      middguard.entities[collection].fetch(options);
    },

    /* middguard.View.prototype.remove
     * Extend the view remove function to remove referenced models
     *
     * Important: If you need to extend remove functionality, you must call
     * `middguard.View.prototype.remove.call(this)` as the super call instead
     * of the usual `Backbone.View.prototype.remove.call(this)`.
     */
    remove: function () {
      var viewName = this.cid;

      console.log('About to remove view "' + viewName + '".');

      // For each model this view references
      this.middguard_entities.forEach(function (entityName) {
        var collection = middguard.entities[entityName];

        // First iteration to remove reference to this model
        collection.each(function (model, i) {
          if (model.get('middguard_views').indexOf(viewName) > -1) {
            removeFromArray(model.get('middguard_views'), viewName);
          }
        });

        // Get an array of models from this entity collection to remove
        var toRemove = collection.filter(function (model) {
          if (model.get('middguard_views').length === 0) {
            delete model.attributes.middguard_views;
            return true;
          }
        });

        console.log('Removing ' + toRemove.length +
                    ' models that are no longer in use from collection "' +
                    entityName + '".');
        // remove them without sending anything to the server
        collection.remove(toRemove);
      });

      console.log('Done removing view "' + viewName + '".');

      // call super
      Backbone.View.prototype.remove.call(this);
    },

    createContext: function() {
      var moduleName = this.model.get('module')
          module = middguard.PackagedModules.findWhere({name: moduleName}),
          connections = JSON.parse(this.model.get('connections')),
          context = {};

      context.inputs = _.reduce(_.keys(connections), function(inputs, inputGroup) {
        var groupConnections = connections[inputGroup].connections,
            outputNode = middguard.Nodes.get(connections[inputGroup].output_node);

        var columns = _.reduce(groupConnections, function(connections, pair) {
          connections[pair.input] = pair.output;
          return connections;
        }, {});

        inputs[inputGroup] = {};
        inputs[inputGroup].collection = middguard.entities[outputNode.get('table')];
        inputs[inputGroup].cols = columns;
        inputs[inputGroup].tableName = outputNode.get('table');

        return inputs;
      }, {});

      return context;
    }
  });

  middguard.activateView = function(node) {
    var main = middguard.Nodes.get(node).module().get('main');
    var ctor = middguard.__modules[main].ctor;
    var live = new ctor({model: middguard.Nodes.get(node)});

    middguard.__modules[node] = {};
    middguard.__modules[node].live = live;

    $('.middguard-views').append(live.render().el);
  };

  middguard.deactivateView = function(node) {
    middguard.__modules[node].live.remove();
    middguard.__modules[node].live = null;
  };

  middguard.toggleView = function(node) {
    if (middguard.__modules[node] && middguard.__modules[node].live) {
      middguard.deactivateView(node);
    } else {
      middguard.activateView(node);
    }
  };

  /* Remove elements from an array.
   * arr is the array to remove from (param 0).
   * Elements to remove are arguments 1 .. n.
   * Source: http://stackoverflow.com/questions/3954438
   */
  function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  }
})();