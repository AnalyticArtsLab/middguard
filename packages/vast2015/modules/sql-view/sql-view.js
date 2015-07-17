var middguard = middguard || {};

(function () {
  'use strict';

  var TableView = middguard.View.extend({
    id: 'tableView',
    
    template: _.template('<div id="table-view"><h1>SQL Table View</h1></div><div id="table-changes"><p id="model-name-text"> <- Select Model </p><input type="submit" id="enter-changes" value="Enter Changes" style="visibility:hidden"/></div><table id="SQLView" style="visibility:hidden"></table>'),
    
    events: {
      'click #enter-changes' : 'enterChanges',
    },
    
    initialize: function () {
      var globalThis = this;
      this.$el.html(this.template);
      
      middguard.state.changedModels = [];
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        this.render(col, resp, opt);
      });
      if (!middguard.state.activeModel || !middguard.state.activeModel.current){
        //make sure that a view has been linked to middguard.state.activeModel.current
        middguard.state.activeModel = {current: null};
        _.extend(middguard.state.activeModel, Backbone.Events);
      }
      this.listenTo(middguard.state.activeModel, 'changedModel', function(){
        if (middguard.state.activeModel.current.active){
          var modName = middguard.state.activeModel.current.model.get('name');
          modName = this.capitalize(pluralize(modName));
          globalThis.queryDB(modName, {limit: '5'});
        }
      });
      
      if (middguard.state.activeModel.current.active){
        var modName = middguard.state.activeModel.current.model.get('name');
        modName = this.capitalize(pluralize(modName));
        globalThis.queryDB(modName, {limit: '5'});
      }
    },
    queryDB: function(entityName, query){
      middguard.entities[entityName].fetch({
        data: query, source: 'tableView'
      });
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    enterChanges: function(){
      var globalThis = this;
      //save all changed models to DB
      middguard.state.changedModels.forEach(function(item){
        middguard.entities[item.entityName].findWhere({id: item.id}).save();
      });
      middguard.state.changedModels.length = 0;
    },

    render: function(col, resp, opt){
      if (opt && opt.source === 'tableView'){
        //make sure call is coming from the intended place
        if (middguard.state.activeModel.current.active){
          var tableName = middguard.state.activeModel.current.model.get('name'); 
        } else {
          var tableName = '&lt;- Select Model';
        }
        document.getElementById('model-name-text').innerHTML = 'Model: ' + tableName;
        document.getElementById('enter-changes').style.visibility = 'visible';
        document.getElementById('SQLView').style.visibility = 'visible';
        d3.selectAll('.SQLRow').remove();
        d3.selectAll('.SQLRowHeader').remove();
        
        var table = document.getElementById('SQLView');
        var row = table.insertRow(0);
        row.className = 'SQLRowHeader';
        var j = 0;
        
        for (var attr in resp[0]){
          //list attribute names
          var cell = row.insertCell(j);
          cell.innerHTML = attr;
          cell.className = 'header-cell';
          cell.contentEditable = true;
          j++;
        }
        
        resp.forEach(function(model, i){
          var row = table.insertRow(i+1);
          var rowView = new RowView(model);
          //rowView.setElement(row);
          row.className = 'SQLRow';
          var j = 0;
          for (var attr in model){
            var cell = row.insertCell(j);
            var cellView = new CellView(model, attr);
            cell.innerHTML = model[attr];
            cell.contentEditable = true;
            cell.className = 'table-cell';
            cellView.setElement(cell);
            j++;
          }
        });
      }
      return this;
    }
  });
  
  var RowView = middguard.View.extend({
    template: _.template('<tr class="table-row"></tr>'),
    
    initialize: function (model){
      this.$el.html(this.template);
      this.model = model;
    },
    
    render: function(){
      return this;
    }
  });
  
  var CellView = middguard.View.extend({
    template: _.template('<td class="table-cell"></td>'),
    events: {
      'input ' : 'trackChanges',
    },
    
    initialize: function(model, attr){
      this.model = model;
      this.attr = attr;
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    trackChanges: function(){
      var entityName = middguard.state.activeModel.current.model.get('name');
      entityName = this.capitalize(pluralize(entityName));
      console.log(this.capitalize);
      //apply the changed attribute to its model, store the model for future saving to DB
      middguard.entities[entityName].findWhere({id: this.model.id}).set(this.attr, this.el.innerHTML);
      middguard.state.changedModels.push({entityName: entityName, id: this.model.id});
    },
    
    render: function(){
      return this;
    }
    
  });

  middguard.addModule('TableView', TableView);
})();