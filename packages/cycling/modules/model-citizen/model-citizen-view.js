var middguard = middguard || {};

(function () {
  'use strict';

  var ModelCitizenView = middguard.View.extend({
    id: 'model-citizen',

    template: _.template(
      '<p class="title">💪 Model Citizen 💪</p>' +
      '<p>Collections</p><ul class="collections"></ul>' +
      '<p>View Reference Counts</p>' +
      '<small>The # of models in the collection referencing a view.</small>' +
      '<ul class="views"></ul>'
    ),

    viewTemplate: _.template('<li><%- name %> referenced by <%- count %> models</li>'),

    initialize: function () {
      this.collectionViews = [];
      this.referenceCountViews = [];

      _.bindAll(this, 'addAllCollectionViews', 'addAllReferenceViews');
    },

    render: function () {
      this.$el.html(this.template());

      _.defer(this.addAllCollectionViews);
      _.defer(this.addAllReferenceViews);

      return this;
    },

    getCollections: function () {
      return _.keys(middguard.entities).filter(function (key) {
        return typeof middguard.entities[key] === 'object';
      });
    },

    addAllCollectionViews: function () {
      var self = this;

      this.getCollections().forEach(function (key) {
        var view = new middguard.CollectionCountView({entity: key});
        self.$('.collections').append(view.render().el);

        self.collectionViews.push(view);
      });
    },

    addAllReferenceViews: function () {
      var self = this;

      this.getCollections().forEach(function (key) {
        var view = new middguard.ViewReferenceCountView({entity: key});
        self.$('.views').append(view.render().el);

        self.referenceCountViews.push(view);
      });
    },

    remove: function () {
       var self = this;

      this.referenceCountViews.forEach(function (view, i) {
        view.remove();
        self.referenceCountViews[i] = null;
      });

      this.collectionViews.forEach(function (view, i) {
        view.remove();
        self.collectionViews[i] = null;
      });

      middguard.View.prototype.remove.call(this);
    }
  });

  middguard.addModule('ModelCitizen', ModelCitizenView);
})();
