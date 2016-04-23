import _ from 'underscore';
import Backbone from 'backbone';
import * as iobind from 'backbone.iobind';

import Analyst from '../models/analyst';
import socket from '../app';

var Analysts = Backbone.Collection.extend({
  socket: socket,

  model: Analyst,

  url: 'analysts',

  initialize () {
    _.bindAll(this, 'serverCreate');
    this.ioBind('create', this.serverCreate, this);
  },

  serverCreate (data) {
    var exists = this.get(data.id);
    if (!exists) {
      this.add(data);
    } else {
      exists.set(data);
    }
  }
});

export default new Analysts();
