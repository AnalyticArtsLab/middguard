import Backbone from 'backbone';
import socket from '../app';

export default Backbone.Model.extend({
  socket: socket,

  defaults: {
    analyst_id: '',
    state: '',
    content: '',
    seen: false
  }
});
