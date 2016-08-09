var middguard = middguard || {};

(function() {
  'use strict';

  middguard.GraphEditorView = Backbone.View.extend({
    className: 'middguard-graph-editor middguard-module',

    tagName: 'div',

    template: _.template($('#graph-editor-template').html()),

    initialize: function(options) {
      this.graph = options.graph;
      this.detailView = null;

      this.listenTo(middguard.PackagedModules, 'reset', this.addModules);
      this.listenTo(middguard.Nodes, 'reset', this.addAllNodes);
      this.listenTo(middguard.Nodes, 'reset', this.addAllConnectorGroups);
      this.listenTo(middguard.Nodes, 'reset', this.ensureEntityCollections);
      this.listenTo(middguard.Nodes, 'add', this.addNode);
      this.listenTo(middguard.Nodes, 'add', this.addConnectorGroup);

      middguard.PackagedModules.fetch({reset: true, data: {}});
      middguard.Nodes.fetch({reset: true, data: {}});
    },

    render: function() {
      this.$el.html(this.template(this.graph.toJSON()));
      d3.select(this.el).select('.editor').append('svg')
          .attr('class', 'graph')
          .attr('width', 700); //change back to 500.

      this.resizeEditor();

      return this;
    },

    ensureEntityCollections: function() {
      middguard.Nodes.each(this.ensureEntityCollection, this);
    },

    ensureEntityCollection: function(node) {
      var tableName = node.get('table');

      if (!tableName || middguard.entities[tableName]) {
        return;
      }

      var collection = new middguard.EntityCollection([], {
        url: tableName
      });

      middguard.entities[tableName] = collection;
    },

    resizeEditor: function() {
      d3.select(this.el).select('.editor svg')
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

      var view = new NodeView({model: node, editor: this});
      this.$('.graph').append(view.render().el);
    },

    addAllNodes: function() {
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
    },

    setDetailView: function(view) {
      if (this.detailView) {
        this.detailView.remove();
      }

      this.$('.detail').html(view.render().el);
      this.detailView = view;
    }
  });

  var ModuleListItemView = Backbone.View.extend({
    tagName: 'li',

    className: 'btn btn-default module',

    template: _.template('<%= displayName %>'),

    events: {
      'click': 'createNode'
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

      if (this.model.get('connections')) {
        this.addAllConnectingLines();
      }

      // `this.model` is the "input" node
      this.listenTo(this.model, 'change', this.render);

      //this.listenTo(this.model, 'pow', ()=>{console.log('node destroyed');});
      this.listenTo(this.model, 'destroy', this.remove);
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
      let outputNode = middguard.Nodes.findWhere({
        id: JSON.parse(this.model.get('connections'))[inputGroup].output_node
      });
      this.listenTo(outputNode, 'destroy', () => {
        this.connections.splice(this.connections.indexOf(view), 1);
        view.remove();
        this.model.removeInputConnection(inputGroup);
      })
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
          x = this.model.position().x,
          h = this.model.get('height'),
          w = this.model.get('width'), //changed from radius
          n = this.module.get('inputs').length,
          offset = NodeView.prototype.inputPosition(i, w, x, n);
           var svg = d3.select('.editor').select('svg');
           var bounds = {x: svg.attr('width'), y: svg.attr('height')};

      return { //controls 'input' positon of paths
        x: x + w/2,
        y: this.model.position().y + offset.y
      };
    },

    outputPosition: function() {
      var w = this.outputNode.get('width');
      var h = this.outputNode.get('height');

      return { //controls 'output' position of paths.
        x: this.outputNode.position().x + w/2,
        y: this.outputNode.position().y + h - 5
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
    },

    deleteConnection: function(){
      console.log(this);
      d3.select(this.el).remove();
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
      'click .run': 'runNode',
      'click .deleteNode':'deleteNode',
      'click': 'toggleDetail'
    },

    initialize: function(options) {
      this.editor = options.editor;
      this.model = options.model;
      this.module = middguard.PackagedModules.findWhere({
        name: this.model.get('module')
      });

      this.d3el = d3.select(this.el)
          .datum(this.model.position());

     //Drag behavior for nodes, modified (2016).
      this.drag = d3.behavior.drag()
          .origin(function(d) { return d; })
          .on('dragstart', this.dragstarted.bind(this))
          .on('drag', this.dragged.bind(this))
          .on('dragend', this.dragended.bind(this)); //binds dragging end event 'dragended' to drag.

      this.listenTo(this.model, 'change', this.render);
    },

    template: _.template($('#graph-node-template').html()),
    //middguard/middguard/views/graph-editor-template.jade

    render: function() {
      var x = this.model.position().x;
      var y = this.model.position().y;

      this.d3el
          .datum(this.model.position()) //binds x,y to 'g'.
        //  .attr('transform', 'translate(' + y + ',' + x + ')')
          //moves nodes to saved positions. //makes rects wayy offset- need to get position set again below in dragged correctly.
          .call(this.drag);

      this.$el.html(this.template({
        w: this.model.get('width'),
        h: this.model.get('height'),
        x: x,
        y: y,
        runPosition: this.runPosition(),
        runPath: d3.svg.symbol().type('triangle-up').size(150)(),
        status: this.model.get('status'),
        statusText: this.model.statusText(),
        displayName: this.module.get('displayName'),
        //add delete glyph here.
        deletePosition: this.deletePosition(),
        deleteNode: d3.svg.symbol().type('cross').size(100)(),
        inputs: this.module.get('inputs'),
        output: this.module.get('outputs').length,
        inputPosition: this.inputPosition
      }));

      var selectedInput = this.model.get('selectedInput'),
          selectedOutput = this.model.get('selectedOutput');
      if (selectedInput) {
        this.d3el.select('[data-name="' + selectedInput.name + '"]')
            .classed('selected', true);
      }

      if (selectedOutput) {
        this.d3el.select('.output')
            .classed('selected', true);
      }

      if (this.model.isVisualization()) {
        this.d3el.classed('visualization', true);
      }


      return this;
    },

    dragstarted: function(d) {
      this.dragStartPosition = _.clone(d);
       d3.selectAll('.node').each( function(d){
        d.order = 0;
      }) //flags unselected nodes as 0, so will sort to bottom with 'sort' funct. Uses '.each' iterating all data on the 'g', adding 'order' & value.
       d3.select(this.el).each(function(d){
         d.order = 1;
       })//flags selected nodes as 1, so will 'sort' to top.
       d3.selectAll('.node').sort(function(a,b) {return a.order-b.order;});
      d3.event.sourceEvent.stopPropagation();
  //   d3.select(this).classed('dragging', true);
    },

    dragged: function(d) {

      var x = d3.event.x;
      var y = d3.event.y;
      var w = this.model.get('width');
      var h = this.model.get('height');

      var svg = d3.select(this.editor.el).select('svg');
      var bounds = {x: svg.attr('width'), y: svg.attr('height')};

      // Prevent element from being dragged out bounds
      //bounds d3.event.x & d3.event.y. NEED both this & min(max()) below!
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (y + h > bounds.y) y = bounds.y - h;
      if (x + w > bounds.x) x = bounds.x - w;

      this.model.position(x, y); //careful. This redeclares x & y as values from node.js!
      //bounds node & path behavior to within the bounds of the svg.
      d3.select(this.el)
          .attr('transform', 'translate(' + (d.x =  Math.min(0,Math.max(x-d3.event.x, bounds.x-w/8))) + ',' + (d.y = Math.min(0, Math.max(y-d3.event.y, bounds.y-h/8))) + ')');
        //  .attr('transform', 'translate(' + (d.x =  x-d3.event.x) + ',' + (d.y = y-d3.event.y) + ')');
    },

    dragended: function() {
      var svg = d3.select(this.editor.el).select('svg');
      if (this.dragMoved())
         d3.event.sourceEvent.stopPropagation();
        //d3.select(this).classed('dragging', false);//removes 'dragging' class.
       this.model.save(); //saves new position.
    },

    dragMoved: function() {
      var origin = this.dragStartPosition,
          current = this.model.position();

      return origin.x !== current.x ||
             origin.y !== current.y;
    },

    showInputTooltip: function(event) {
      var tooltip = d3.select('.input-tooltip');

      if (!tooltip[0][0]) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'input-tooltip');
      }

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
      if (previouslySelected) {
        previouslySelected.set('selectedInput', null);
      }

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

    toggleOutputSelected: function() {
      var previouslySelected = middguard.Nodes.find(function(node) {
        return node.get('selectedOutput');
      });

      if (previouslySelected) {
        previouslySelected.set('selectedOutput', null);
      }

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
      if (this.model.isVisualization()) {
        middguard.toggleView(this.model.get('id'));
      } //else {
        this.model.run();
      //}
    },

    /*THIS DOES NOT YET HANDLE THE SINGLETON VARIABLE - WILL DELETE ALL NODES ASSOCIATED WITH THE SAME TABLE */
    deleteNode: function(){
      var tableName = this.model.get('table');
      //removes node from middguard.entities
      delete middguard.entities[tableName];
      //removes node from view
      this.remove();
      //removes node from database table
      this.model.destroy();
    },

    toggleDetail: function() {
      var view = new NodeDetailView({model: this.model});

      this.editor.$('.node').removeClass('selected');
      this.$el.addClass('selected');

      this.editor.setDetailView(view);
    },

    runPosition: function() {
      var x = this.model.position().x;
      var y = this.model.position().y;
      var h = this.model.get('height');
      var w = this.model.get('width');
      return {
        x: (x + w/2),
        y: y+ h/2+h/4-2
      };
    },

    deletePosition: function() {
      var x = this.model.position().x;
      var y = this.model.position().y;
      return {
        x: x + 10,
        y: y + 10
      };
    },

    //r changed to width (w) 2016.
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

     //check to be sure works for multiple input.
    //Used for dot location.
    inputPosition: function(i, w, x, n) {
      var rowIndexX = i % 5,
          rowIndexY = Math.floor(i / 5),
          rowLength = i >= n - n % 5 ? n % 5 : 5,
          baseX = x+w/2,
          baseY = 5;
        //  baseX =(x + w/2) - (rowLength - 1);
          // baseY = 10;

      return {
        x: baseX + 15 * rowIndexX,
        y: baseY + 15 * rowIndexY
      };
    }
  });

  var NodeDetailView = Backbone.View.extend({
    initialize: function() {
      this.connections = JSON.parse(this.model.get('connections'));
      this.module = this.model.module();

      this.selectedInputGroup = null;
      this.selectedOutput = null;
      this.selectedInput = null;

      this.listenTo(this.model, 'change', this.render);
    },

    template: _.template(
      `<h4><%- name %></h4>
      <div class="connection-groups"><div>`),

    connectionGroupTemplate: _.template($('#connection-group-template').html()),

    events: {
      'click .connection': 'selectConnector'
    },

    render: function() {
      this.$el.html(this.template({
        name: this.module.get('displayName')
      }));

      this.addAllConnectionGroups();

      return this;
    },

    addAllConnectionGroups: function() {
      _.each(this.connections, (value, key) => {
        var inputs = value.connections.map(connection => connection.input),
            outputs = value.connections.map(connection => connection.output),
            outputNode = middguard.Nodes.get(value.output_node),
            outputModule = middguard.PackagedModules.findWhere({
              name: outputNode.get('module')
            });

        this.$('.connection-groups').prepend(this.connectionGroupTemplate({
          inputGroupName: key,
          inputs: inputs,
          unconnectedInputs: this.model.unconnectedInputs(key),
          outputModuleName: outputModule.get('displayName'),
          outputs: outputs,
          unconnectedOutputs: this.model.unconnectedOutputs(key)
        }));
      });
    },

    deselectOutput: function() {
      this.selectedOutput = null;
      this.$('.connection.output').removeClass('selected');
    },

    deselectInput: function() {
      this.selectedInput = null;
      this.$('.connection.input').removeClass('selected');
    },

    selectConnector: function(event) {
      var $clicked = $(event.target),
          group = $clicked.closest('.connection-list-group').data('inputgroup'),
          name = $clicked.text(),
          isInput = $clicked.hasClass('input'),
          isOutput = $clicked.hasClass('output'),
          sameGroup = this.selectedInputGroup === group;

      if (isInput) {
        if (sameGroup) this.deselectInput();
        else this.deselectOutput();

        this.selectedInput = name;
      }

      if (isOutput) {
        if (sameGroup) this.deselectOutput();
        else this.deselectInput();

        this.selectedOutput = name;
      }

      this.selectedInputGroup = group;
      $clicked.addClass('selected');
      this.connectSelection();
    },

    connectSelection: function() {
      if (!this.selectedInputGroup ||
          !this.selectedInput ||
          !this.selectedOutput) {
        return;
      }

      var connections = this.connections[this.selectedInputGroup].connections;

      var exists = _.find(connections, {input: this.selectedInput}) ||
                   _.find(connections, {output: this.selectedOutput});

      if (exists) {
        exists.input = this.selectedInput;
        exists.output = this.selectedOutput;
      } else {
        connections.push({
          input: this.selectedInput,
          output: this.selectedOutput
        });
      }

      this.connections[this.selectedInputGroup].connections = connections;

      this.deselectInput();
      this.deselectOutput();
      this.selectedInputGroup = null;

      this.model.set('connections', JSON.stringify(this.connections));
      this.model.save();
    }
  });
})();
