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
      this.listenTo(middguard.Nodes, 'reset', this.addAllConnectorGroups);
      this.listenTo(middguard.Nodes, 'add', this.addNode);
      this.listenTo(middguard.Nodes, 'add', this.addConnectorGroup)

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
    },

    addConnectorGroup: function(node) {
      if (node.get('graph_id') !== this.graph.get('id')) {
        return;
      }

      var view = new ConnectorGroupView({model: node});
      this.$('.graph').append(view.render().el);
    },

    addAllConnectorGroups: function() {
      middguard.Nodes.each(this.addConnectorGroup, this);
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

  /* Nodes' connections are stored on the input node.
   * All the connecting lines from an a node's connections
   * to the corresponding output node.
   */
  var ConnectorGroupView = Backbone.NSView.extend({
    tagName: 'svg:g',

    initialize: function() {
      this.connections = [];

      if (this.model.get('connections'))
        this.addAllConnectingLines();

      // `this.model` is the "input" node
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.connections.forEach(connection => connection.render());
      this.unrenderedConnections().forEach(this.addConnectingLine, this);

      return this;
    },

    addAllConnectingLines: function() {
      _.chain(JSON.parse(this.model.get('connections')))
          .keys()
          .each(this.addConnectingLine, this);
    },

    addConnectingLine: function(inputGroup) {
      var view = new ConnectorView({
        model: this.model,
        inputGroup: inputGroup
      });
      this.$el.append(view.render().el);
      this.connections.push(view);
    },

    renderedConnections: function() {
      return this.connections.map(connection => connection.inputGroup);
    },

    unrenderedConnections: function() {
      return _.chain(JSON.parse(this.model.get('connections')))
          .keys()
          .difference(this.renderedConnections());
    }
  });

  var ConnectorView = Backbone.NSView.extend({
    tagName: 'svg:path',

    className: 'connecting-line',

    initialize: function(options) {
      this.model = options.model;
      this.inputGroup = options.inputGroup;
      this.outputNode = middguard.Nodes.findWhere({
        id: JSON.parse(this.model.get('connections'))[this.inputGroup].output_node
      });
      this.module = middguard.PackagedModules.findWhere({
        name: this.model.get('module')
      });

      this.diagonal = d3.svg.diagonal();

      // Only rerender this particular line when the output node moves.
      // We rerender all the lines (parent view) when the input node moves.
      this.listenTo(this.outputNode, 'change', this.render);

      // Check if the connection has changed. In this context, "changed"
      // means that the connection's input group either no longer has a
      // connection, or the input group is connected to a different output.
      this.listenTo(this.model, 'change', this.connectionChanged);
    },

    render: function() {
      this.diagonal
          .source(this.outputPosition())
          .target(this.inputPosition());

      this.$el.attr('d', this.diagonal());

      return this;
    },

    inputPosition: function() {
      var i = _.findIndex(this.module.get('inputs'), input => {
            return input.name === this.inputGroup;
          }),
          r = this.model.get('radius'),
          n = this.module.get('inputs').length,
          offset = NodeView.prototype.inputPosition(i, r, n);

      return {
        x: this.model.position().x + offset.x,
        y: this.model.position().y + offset.y
      };
    },

    outputPosition: function() {
      var r = this.outputNode.get('radius');

      return {
        x: this.outputNode.position().x + r,
        y: this.outputNode.position().y + 2 * r - 10
      };
    },

    connectionChanged: function() {
      var connections = this.model.get('connections'),
          connection = JSON.parse(connections)[this.inputGroup];

      // No longer a connection for this input group
      if (!connection) {
        this.remove();
      }

      // A connection exists for this input group, but connected to a
      // different output node
      if (connection.output_node !== this.outputNode.get('id')) {
        // Stop listening to changes in the old output node
        this.stopListening(this.outputNode);

        // Find and bind to the new output node
        this.outputNode = middguard.Nodes.get(connection.output_node);
        this.listenTo(this.outputNode, 'change', this.render);
        this.render();
      }
    }
  });

  var NodeView = Backbone.NSView.extend({
    tagName: 'svg:g',

    className: 'node',

    events: {
      'mouseover .input': 'showInputTooltip',
      'mouseout .input': 'hideInputTooltip',
      'click .input': 'toggleInputSelected',
      'click .output': 'toggleOutputSelected',
      'click .status': 'runNode'
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
          .on('dragstart', this.dragstarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('dragend', this.dragended.bind(this));

      this.listenTo(this.model, 'change', this.render);
    },

    template: _.template($('#graph-node-template').html()),

    render: function() {
      var x = this.model.position().x;
      var y = this.model.position().y;

      this.d3el
          .datum(this.model.position())
          .attr('transform', 'translate(' + x + ',' + y + ')')
          .call(this.drag);

      this.$el.html(this.template({
        r: this.model.get('radius'),
        handlePosition: this.dragHandlePosition(),
        dragHandlePath: d3.svg.symbol().type('cross').size(150)(),
        status: this.model.get('status'),
        statusText: this.model.statusText(),
        displayName: this.module.get('displayName'),
        inputs: this.module.get('inputs'),
        output: this.module.get('outputs').length,
        inputPosition: this.inputPosition
      }));

      var selectedInput = this.model.get('selectedInput'),
          selectedOutput = this.model.get('selectedOutput');
      if (selectedInput)
        this.d3el.select('[data-name="' + selectedInput.name + '"]')
            .classed('selected', true);

      if (selectedOutput)
        this.d3el.select('.output')
            .classed('selected', true);

      return this;
    },

    dragstarted: function(d) {
      this.dragStartPosition = _.clone(d);
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
      if (this.dragMoved())
        this.model.save();
    },

    dragMoved: function() {
      var origin = this.dragStartPosition,
          current = this.model.position();

      return origin.x !== current.x ||
             origin.y !== current.y;
    },

    showInputTooltip: function(event) {
      var tooltip = d3.select('.input-tooltip');

      if (!tooltip[0][0])
        tooltip = d3.select('body').append('div')
            .attr('class', 'input-tooltip');

      var input = _.find(this.module.get('inputs'), function(input) {
        return input.name === $(event.currentTarget).data('name');
      });
      tooltip.html(input.name);

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

    toggleInputSelected: function(event) {
      var previouslySelected = middguard.Nodes.find(function(node) {
        return node.get('selectedInput');
      });

      // Deselect the previously selected input.
      previouslySelected && previouslySelected.set('selectedInput', null);

      var selectedGroup = _.find(this.module.get('inputs'), function(input) {
        return input.name === $(event.target).data('name');
      });

      // If the clicked node was already selected, return after toggling it off.
      if (previouslySelected &&
          this.model.get('id') === previouslySelected.get('id') &&
          selectedGroup.name === previouslySelected.get('name')) {
        return;
      }

      this.model.set('selectedInput', selectedGroup);
      this.connectNodes();
    },

    toggleOutputSelected: function(event) {
      var previouslySelected = middguard.Nodes.find(function(node) {
        return node.get('selectedOutput');
      })

      previouslySelected && previouslySelected.set('selectedOutput', null);

      this.model.set('selectedOutput', true);
      this.connectNodes();
    },

    connectNodes: function() {
      var input = middguard.Nodes.find(function(node) {
        return node.get('selectedInput');
      });

      var output = middguard.Nodes.find(function(node) {
        return node.get('selectedOutput');
      });

      if (!input || !output)
        return;

      var group = input.get('selectedInput').name;

      input.connectToOutput(output, group);
      input.set('selectedInput', null);
      output.set('selectedOutput', null);
    },

    runNode: function() {
      this.model.run();
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
