import _ from 'underscore';
import Backbone from 'backbone';
import {socket} from '../app';

export default Backbone.Model.extend({
  socket: socket

  blacklistAttributes: [
    'selectedInput',
    'selectedOutput'
  ],

  defaults: {
    status: 0,
    radius: 75,
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

  connectToOutput (other, inputGroup) {
    socket.emit('node:connect', {
      outputNode: other.get('id'),
      inputNode: this.get('id'),
      inputGroup: inputGroup
    });
  },

  run () {
    socket.emit('node:run', {
      id: this.get('id')
    });
  },

  position (x, y) {
    if (!arguments.length) {
      return {x: this.get('position_x'), y: this.get('position_y')};
    } else {
      this.set('position_x', x);
      this.set('position_y', y);
    }
  },

  toJSON (options) {
    return _.omit(this.attributes, this.blacklistAttributes);
  },

  statusText () {
    return this.statusMap[this.get('status')];
  }
});
