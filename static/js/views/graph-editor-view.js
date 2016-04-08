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
          .attr('width', 500);

      this.resizeEditor();

      return this;
    },

    resizeEditor: function() {
      d3.select(this.el).select('svg')
          .attr('height', $(window).height() - this.$('.header').outerHeight());
    },

    addModules: function() {
      this.$('.modules-list').html('');

      middguard.PackagedModules.each(function(model) {
        var view = new ModuleListItemView({model: model, graph: this.graph});
        this.$('.modules-list').append(view.render().el);
      }.bind(this));

      this.resizeEditor();
    },

    addNode: function(node) {
      if (node.get('graph_id') !== this.graph.get('id')) {
        return;
      }

      var view = new NodeView({model: node, editorElement: this.el});
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

    events: {
      'mouseover .input': 'showInputTooltip',
      'mouseout .input': 'hideInputTooltip'
    },

    initialize: function(options) {
      this.editor = options.editorElement;
      this.model = options.model;
      this.module = middguard.PackagedModules.findWhere({
        name: this.model.get('module')
      });

      this.d3el = d3.select(this.el)
          .datum(this.model.position());

      this.drag = d3.behavior.drag()
          .origin(function(d) { return d; })
          .on('drag', this.dragged.bind(this))
          .on('dragend', this.dragended.bind(this));

      this.listenTo(this.model, 'update', this.render);
    },

    render: function() {
      var handle = this.dragHandlePosition();
      var x = this.model.position().x;
      var y = this.model.position().y;

      this.d3el
          .datum(this.model.position())
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .call(this.drag);

      var r = this.model.get('radius');
      this.d3el.append('circle')
          .attr('class', 'outline')
          .attr('r', r)
          .attr('cx', r)
          .attr('cy', r);

      this.d3el.append('text')
          .attr('x', r)
          .attr('y', r)
          .style('text-anchor', 'middle')
          .text(this.module.get('displayName'));

      this.d3el.append('circle')
          .attr('class', 'drag-handle')
          .attr('cx', handle.x)
          .attr('cy', handle.y)
          .attr('r', 20);

      this.d3el.append('path')
          .attr('class', 'drag-handle')
          .attr('transform', 'translate(' + handle.x + ',' + handle.y + ')')
          .attr('d', d3.svg.symbol().type('cross').size(150));

      var inputs = this.module.get('inputs');
      this.d3el.selectAll('.input')
          .data(inputs)
        .enter().append('circle')
          .attr('class', 'connector input')
          .attr('r', 5)
          .attr('cx', (d, i) => this.inputPosition(i, r, inputs.length).x)
          .attr('cy', (d, i) => this.inputPosition(i, r, inputs.length).y)

      if (this.module.get('outputs').length)
        this.d3el.append('circle')
            .attr('class', 'connector output')
            .attr('r', 5)
            .attr('cx', r)
            .attr('cy', 2 * r - 10);

      return this;
    },

    dragged: function(d) {
      if (!d3.select(d3.event.sourceEvent.target).classed('drag-handle'))
        return;

      var x = d3.event.x;
      var y = d3.event.y;
      var r = this.model.get('radius');

      var svg = d3.select(this.editor).select('svg');
      var bounds = {x: svg.attr('width'), y: svg.attr('height')};

      // Prevent element from being dragged out bounds
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (y + r * 2 > bounds.y) y = bounds.y - r * 2;
      if (x + r * 2 > bounds.x) x = bounds.x - r * 2;

      this.model.position(x, y);
      d3.select(this.el)
          .attr('transform', 'translate(' + (d.x = x) + ',' + (d.y = y) + ')');
    },

    dragended: function() {
      this.model.save();
    },

    showInputTooltip: function(event) {
      var tooltip = d3.select('.input-tooltip');

      if (!tooltip[0][0])
        tooltip = d3.select('body').append('div')
            .attr('class', 'input-tooltip');

      tooltip.html(d3.select(event.currentTarget).datum().name);

      var bounds = event.currentTarget.getBoundingClientRect(),
          inputRadius = 5,
          tooltipWidth = parseFloat(tooltip.style('width')) / 2,
          tooltipHeight = parseFloat(tooltip.style('height')) + 5;

      tooltip
        .style('left', bounds.left - tooltipWidth + inputRadius + 'px')
        .style('top', bounds.top - tooltipHeight + 'px')
        .style('visibility', 'visible');
    },

    hideInputTooltip: function() {
      d3.select('.input-tooltip')
          .style('visibility', 'hidden');
    },

    dragHandlePosition: function() {
      var r = this.model.get('radius');
      return {
        x: r + -r * Math.sqrt(2) / 2 + 15,
        y: r - r * Math.sqrt(2) / 2 + 15
      };
    },

    /* Calculate each input circle's position.
     * Circles are arranged in rows of three from the top down.
     * Assume 5 pixel circle radius and 15 pixels spacing between
     * circle centerpoints. Circles are centered around the node's centerline.
     *
     * Example: 5 inputs (x is an input circle)
     *     x <--15px-->  x  <--15px--> x
     *          (15px between rows)
     *           x <-- 15px --> x
     *
     * @param i: input index
     * @param r: the input parent node's radius
     * @param n: total number of inputs for the node
     *
     * @return the center position for the input circle
     */
    inputPosition: function(i, r, n) {
      var rowIndexX = i % 3,
          rowIndexY = Math.floor(i / 3),
          rowLength = i >= n - n % 3 ? n % 3 : 3,
          baseX = r - (rowLength - 1) * 7.5,
          baseY = 10;

      return {
        x: baseX + 15 * rowIndexX,
        y: baseY + 15 * rowIndexY
      };
    }
  });
})();
