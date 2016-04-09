var middguard = middguard || {};

(function() {
  middguard.Node = Backbone.Model.extend({
    blacklistAttributes: [
      'selectedInput',
      'selectedOutput'
    ],

    defaults: {
      radius: 75,
      position_x: 0,
      position_y: 0,
      selectedInput: null,
      selectedOutput: null
    },

    connectToOutput: function(other, inputGroup) {
      middguard.socket.emit('node:connect', {
        outputNode: other.get('id'),
        inputNode: this.get('id'),
        inputGroup: inputGroup
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

    toJSON: function(options) {
      return _.omit(this.attributes, this.blacklistAttributes);
    }
  });
})();
