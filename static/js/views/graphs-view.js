import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';

export default Backbone.View.extend({
  className: 'middguard-graphs',

  template: _.template($('#graphs-panel-template').html()),

  events: {
    'click #create-new-graph': 'createGraph'
  },

  initialize () {
    this.listenTo(middguard.Graphs, 'add', this.addOneGraph);
    this.listenTo(middguard.Graphs, 'reset', this.addAllGraphs);

    middguard.Graphs.fetch({reset: true});
  },

  render: function() {
    this.$el.html(this.template());

    this.$graphs = this.$('.graphs-list');

    return this;
  },

  addOneGraph: function(graph) {
    var graphView = new GraphView({model: graph});

    this.$graphs.append(graphView.render().el);
  },

  addAllGraphs: function() {
    middguard.Graphs.each(this.addOneGraph, this);
  },

  createGraph: function(e) {
    e.preventDefault();
    var name = this.$('#new-graph-name').val().trim();

    middguard.Graphs.create({name: name});
  }
});

var GraphView = Backbone.View.extend({
  className: 'middguard-graph list-group-item',

  tagName: 'a',

  template: _.template('<%= name %>'),

  events: {
    'click': 'toggleEditor'
  },

  initialize: function() {
    this.editing = false;

    this.listenTo(this.model, 'update', this.render);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));

    this.$el.attr('href', '#');
    return this;
  },

  toggleEditor: function() {
    if (this.editor) {
      this.editor.remove();
      this.editor = null;
    } else {
      this.editor = new middguard.GraphEditorView({graph: this.model});
      $('.middguard-views').append(this.editor.render().el);
    }

    this.$el.toggleClass('active', Boolean(this.editor));
  }
});
