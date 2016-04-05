var middguard = middguard || {};

(function() {
  middguard.Node = Backbone.Model.extend({
    connectToOutput: function(other, inputGroup) {
      middguard.socket.emit('node:connect', {
        outputNode: other.get('id'),
        inputNode: this.get('id'),
        inputGroup: inputGroup
      });
    }
  });
})();
