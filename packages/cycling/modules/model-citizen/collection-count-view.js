var middguard = middguard || {};

(function () {
  'use strict';

  var CollectionCountView = middguard.View.extend({
    tagName: 'li',

    className: 'collection-count',

    template: _.template('<b><%- name %></b>: <%- count %> instances'),

    initialize: function (options) {
      this.entity = options.entity;

      this.listenTo(middguard.entities[this.entity], 'all', this.render);
    },

    render: function () {
      this.$el.html(this.template({
        name: this.entity,
        count: middguard.entities[this.entity].length
      }));

      return this;
    }

  });

  middguard.CollectionCountView = CollectionCountView;
  middguard.addSubview('CollectionCountView', CollectionCountView);
})();
