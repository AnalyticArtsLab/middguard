import $ from 'jquery';
import Backbone from 'backbone';
import HeaderView from './header-view';

export default Backbone.View.extend({
  initialize: function () {
    this.$body = $('body');
    this.header = new HeaderView();
    // this.packages = new middguard.PackagesView();
    this.render();
  },
  render: function () {
    this.header.render();
    // $('#obs-control-div').append(this.packages.render().el);
  }
});
