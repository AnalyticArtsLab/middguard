import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';

import Analysts from '../collections/analysts';
import Messages from '../collections/messages';

export default Backbone.View.extend({
  id: 'observations',

  template: _.template(
    '<div class="log-messages"></div>' +
    '<textarea class="log-new-message" placeholder="Record an observation..."></textarea>'
  ),

  events: {
    'keydown .log-new-message': 'sendMessage',
    'click': 'focusInput'
  },

  initialize () {
    _.bindAll(this, 'addOne', 'addAll');

    this.listenTo(Messages, 'add', this.addOne);
    this.listenTo(Messages, 'reset', this.addAll);

    Analysts.fetch();
    Messages.fetch({reset: true});
  },

  render () {
    this.$el.html(this.template());

    this.$log = this.$('.log-messages');
    this.$input = this.$('.log-new-message');

    return this;
  },

  messageContents () {
    return {
      content: this.$input.val().trim(),
      analyst_id: middguard.user.id,
      seen: true,
      state: JSON.stringify(middguard.state.toJSON())
    }
  },

  addOne (message) {
    var view = new ObsMessageView({model: message});
    this.$log.append(view.render().el);
  },

  addAll () {
    Messages.each(this.addOne);
  },

  sendMessage (event) {
    if (event.which === 13 && !event.shiftKey) {
      event.preventDefault();

      var message = Messages.create(this.messageContents());
      this.$input.val('');

			//scroll to bottom when a message is entered
			this.$log.scrollTop(this.$log[0].scrollHeight);
      return false;
    }
  },

  focusInput () {
    this.$input.focus();
  }
});

var ObsMessageView = Backbone.View.extend({
  tagName: 'div',

  className: 'middguard-obs-message',

  template: _.template(
    '<div class="middguard-obs-message-meta">' +
      '<%= analyst %>' +
      '<span class="timeOrRestore"><%= time %></span>' +
    '</div>' +
    '<div class="middguard-obs-message-content"><%= content %></div>'
  ),

  events: {
    'mouseover': 'showRestoreState',
    'mouseout': 'showTime',
    'click .timeOrRestore': 'restoreState'
  },

  initialize () {
    this.analyst = Analysts.findWhere({
      id: this.model.get('analyst_id')
    });

    this.sentBySelf = this.analyst.get('id') === middguard.user.id;

    this.listenTo(this.model, 'change', this.render);
  },

  render () {
    var attrs = {
      analyst: this.analyst.get('username'),
      content: this.model.get('content'),
      time: moment(this.model.get('timestamp')).calendar()
    };
    this.$el.html(this.template(attrs));
    this.$el.toggleClass('sent-by-self', this.sentBySelf);
    return this;
  },

  showRestoreState () {
    this.$el.find('span').html('Restore state');
  },

  showTime () {
    this.$el.find('span').html(moment(this.model.get('timestamp')).calendar());
  },

  restoreState () {
    var state = JSON.parse(this.model.get('state'));
    middguard.state.set(state)
  }
});
