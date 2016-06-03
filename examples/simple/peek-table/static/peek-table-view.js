var middguard = middguard || {};

(function() {
  var PeekTableView = middguard.View.extend({
    id: 'hashtags-table',

    className: 'list-unstyled middguard-module',

    tagName: 'table',

    template: _.template(
      '<th><tr><td><%- col1 %></td><td><%- col2 %></td><td><%- col3 %></td><td><%- col4 %></td></tr></th>'
    ),

    rowTemplate: _.template(
      '<tr><td><%- col1 %></td><td><%- col2 %></td><td><%- col3 %></td><td><%- col4 %></td></tr>'
    ),

    initialize: function() {
      this.context = this.createContext();

      var collection = this.context.inputs.table.collection;

      var tableName = this.context.inputs.table.tableName;
      this.listenTo(collection, 'reset', this.addAllRows);

      this.fetch(tableName, {reset: true, data: {}});
    },

    render: function() {
      var cols = this.context.inputs.table.cols;

      this.$el.html(this.template({
        col1: cols.col1,
        col2: cols.col2,
        col3: cols.col3,
        col4: cols.col4
      }));

      return this;
    },

    addAllRows: function() {
      var collection = this.context.inputs.table.collection;
      collection.each(this.addOneRow, this);
    },

    addOneRow: function(row) {
      var cols = this.context.inputs.table.cols;

      console.log(cols, row)

      this.$el.append(this.rowTemplate({
        col1: row.get(cols.col1),
        col2: row.get(cols.col2),
        col3: row.get(cols.col3),
        col4: row.get(cols.col4)
      }));
    }
  });

  middguard.PeekTableView = PeekTableView;
  middguard.addModule('PeekTableView', PeekTableView);
})();
