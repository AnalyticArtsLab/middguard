var middguard = middguard || {};

(function() {
  middguard.Node = Backbone.Model.extend({
    blacklistAttributes: [
      'selectedInput',
      'selectedOutput'
    ],

    defaults: {
      status: 0,
      width: 190,
      height: 50,
      position_x: 0,
      position_y: 0,
      selectedInput: null,
      selectedOutput: null,
      connections: '{}'
    },

    statusMap: {
      0: 'Not run',
      1: 'In progress',
      2: 'Completed'
    },

    connectToOutput: function(other, inputGroup) {
      middguard.socket.emit('node:connect', {
        outputNode: other.get('id'),
        inputNode: this.get('id'),
        inputGroup: inputGroup
      });
    },

    run: function() {
      middguard.socket.emit('node:run', {
        id: this.get('id')
      });
    },

    position: function(x, y) {
      if (!arguments.length) {
        return {x: this.get('position_x'), y: this.get('position_y')};
      } else {
        this.set('position_x', x);
        this.set('position_y', y);
      }
    },

    toJSON: function() {
      return _.omit(this.attributes, this.blacklistAttributes);
    },

    statusText: function() {
      return this.statusMap[this.get('status')];
    },

    module: function() {
      return middguard.PackagedModules.findWhere({
        name: this.get('module')
      });
    },

    unconnectedInputs: function(inputGroup) {
      var connections = JSON.parse(this.get('connections'))[inputGroup],
          allInputs = _.find(this.module().get('inputs'),
                             {name: inputGroup}).inputs;

      if (!connections) {
        return allInputs;
      }

      var connectedInputs = connections.connections.map(c => c.input);
      return _.difference(allInputs, connectedInputs);
    },

    unconnectedOutputs: function(inputGroup) {
      var connections = JSON.parse(this.get('connections'))[inputGroup];

      if (!connections.output_node) {
        return [];
      }

      var connectedOutputs = connections.connections.map(c => c.output);
      var outputNode = middguard.Nodes.get(connections.output_node);
      var allOutputs = middguard.PackagedModules
          .find({name: outputNode.get('module')})
          .get('outputs');

      return _.difference(allOutputs, connectedOutputs);
    },

    isVisualization: function() {
      return this.module().get('visualization');
    }
  });
})();
