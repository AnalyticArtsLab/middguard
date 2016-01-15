var middguard = middguard || {};

(function () {
  'use strict';

  var ViewReferenceCountView = middguard.View.extend({
    tagName: 'li',

    className: 'view-reference-count',

    template: _.template('<b><%- name %></b><ul class="view-counts"></ul>'),

    viewTemplate: _.template('<li class="view-count"><b><%- cid %></b>: <%- count %></li>'),

    initialize: function (options) {
      this.entity = options.entity;

      this.listenTo(middguard.entities[this.entity], 'remove sync', this.render);
    },

    render: function () {
      this.$el.html(this.template({
        name: this.entity,
        count: middguard.entities[this.entity].length
      }));

      var self = this;
      var viewCounts = this.aggregateViews();
      _.keys(viewCounts).forEach(function (key) {
        self.$('.view-counts').append(self.viewTemplate({
          cid: key,
          count: viewCounts[key]
        }));
      });

      return this;
    },

    aggregateViews: function () {
      var views = {};

      middguard.entities[this.entity].each(function (model) {
        (model.get('middguard_views') || []).forEach(function (cid) {
          if (_.has(views, cid)) {
            views[cid]++;
          } else {
            views[cid] = 1;
          }
        });
      });

      // console.log(views);
      return views;
    }

  });

  middguard.ViewReferenceCountView = ViewReferenceCountView;
  middguard.addSubview('ViewReferenceCountView', ViewReferenceCountView);
})();
