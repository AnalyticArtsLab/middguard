var middguard = middguard || {};

(function() {
  'use strict';

  middguard.GraphEditorView = Backbone.View.extend({
    className: 'middguard-graph-editor middguard-module',

    tagName: 'div',

    template: _.template($('#graph-editor-template').html()),

    initialize: function(options) {
      this.graph = options.graph;

      this.listenTo(middguard.PackagedModules, 'reset', this.addModules);
      this.listenTo(middguard.Nodes, 'reset', this.addAllNodes);
      this.listenTo(middguard.Nodes, 'add', this.addNode);

      middguard.PackagedModules.fetch({reset: true});
      middguard.Nodes.fetch({reset: true});
    },

    render: function() {
      this.$el.html(this.template(this.graph.toJSON()));
      d3.select(this.el).append('svg')
          .attr('class', 'graph')
          .attr('height', $(window).height() - this.$('.header').height());

      return this;
    },

    addModules: function() {
      this.$('.modules-list').html('');

      middguard.PackagedModules.each(function(model) {
        var view = new ModuleListItemView({model: model, graph: this.graph});
        this.$('.modules-list').append(view.render().el);
      }.bind(this));
    },

    addNode: function(node) {
      if (node.get('graph_id') !== this.graph.get('id')) {
        return;
      }

      var view = new NodeView({model: node});
      this.$('.graph').append(view.render().el);
    },

    addAllNodes: function(node) {
      middguard.Nodes.each(this.addNode, this);
    }
  });

  var ModuleListItemView = Backbone.View.extend({
    tagName: 'li',

    className: 'btn btn-default module',

    template: _.template('<%= displayName %>'),

    events: {
      'click': 'createNode',
    },

    initialize: function(options) {
      this.model = options.model;
      this.graph = options.graph;
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    createNode: function() {
      middguard.Nodes.create({
        module: this.model.get('name'),
        graph_id: this.graph.get('id')
      });
    }
  });

  var NodeView = Backbone.NSView.extend({
    tagName: 'svg:g',

    className: 'node',

    initialize: function() {
      this.d3el = d3.select(this.el)
          .datum(this.model.position());

      this.drag = d3.behavior.drag()
          .origin(function(d) { return d; })
          .on('drag', this.dragged.bind(this))
          .on('dragend', this.dragended.bind(this));

      this.listenTo(this.model, 'update', this.render);
    },

    render: function() {
      var x = this.model.position().x;
      var y = this.model.position().y;

      this.d3el
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .call(this.drag);

      var r = this.model.get('radius');
      this.d3el.append('circle')
          .attr('r', r)
          .attr('cx', r)
          .attr('cy', r);

      this.d3el.append('text')
          .attr('x', r)
          .attr('y', r)
          .style('text-anchor', 'middle')
          .text(this.model.get('module'));

      return this;
    },

    dragged: function(d) {
      var x = d3.event.x;
      var y = d3.event.y;

      this.model.position(x, y);
      d3.select(this.el)
          .attr('transform', 'translate(' + (d.x = x) + ',' + (d.y = y) + ')');
    },

    dragended: function() {
      this.model.save();
    }
  });
})();
