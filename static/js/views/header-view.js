var middguard = middguard || {};

(function () {
  'use strict';

  middguard.HeaderView = Backbone.View.extend({
    id: 'middguard-header',
    template: _.template(
      '<h1 id="middguard-subHeader">MiddGuard</h1>' +
      '<div id="middguard-user"><% print(middguard.user.username) %>' +
        '<form class="logout" action="/logout" method="post">' +
          '<input type="submit" value="Logout">' +
        '</form></div>' +
      '<div id="view-options">' +
      '<input class="viewOption" type="submit" value="Control Panel" id="mod_button"/>' +
        '<input class="viewOption" type="submit" value="Observations" id="obs_button"/>' +
      '</div>'
    ),
    events: {
      'click #obs_button' : 'obsShow',
      'click #mod_button': 'obsHide'
    },
    initialize: function () {
      return true;
    },
    render: function () {
      this.$el.html(this.template());
      return this;
    },
    obsShow: function(){
      $('#middguard-obs').css('display', 'initial');
    },
    obsHide: function(){
      $('#middguard-obs').css('display', 'none');
    }
  });
})();