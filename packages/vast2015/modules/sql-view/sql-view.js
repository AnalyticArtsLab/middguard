var middguard = middguard || {};

(function () {
  'use strict';

  var TableView = middguard.View.extend({
    id: 'tableView',
    
    template: _.template('<div id="table-view"><h1>SQL Table View</h1></div><div id="table-changes"><p id="model-name-text"> <- Select Model </p><input type="submit" id="enter-changes" value="Enter Changes" style="visibility:hidden"/></div><table id="SQLView" style="visibility:hidden"></table>'),
    
    initialize: function () {
      var globalThis = this;
      this.$el.html(this.template);
      
      this.listenTo(middguard.entities.Locationcounts, 'sync', function(col, resp, opt){
        this.render(col, resp, opt);
      });
      if (!middguard.state.activeModel || !middguard.state.activeModel.current){
        //make sure that a view has been linked to middguard.state.activeModel.current
        middguard.state.activeModel = {current: null};
        _.extend(middguard.state.activeModel, Backbone.Events);
      }
      var capitalize = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
      this.listenTo(middguard.state.activeModel, 'changedModel', function(){
        console.log(middguard.state.activeModel);
        if (middguard.state.activeModel.current.active){
          var modName = middguard.state.activeModel.current.model.get('name');
          modName = capitalize(pluralize(modName));
          globalThis.queryDB(modName, {limit: '5'});
        }
      });
      
      if (middguard.state.activeModel.current.active){
        var modName = middguard.state.activeModel.current.model.get('name');
        modName = capitalize(pluralize(modName));
        globalThis.queryDB(modName, {limit: '5'});
      }
    },
    queryDB: function(entityName, query){
      middguard.entities[entityName].fetch({
        data: query, source: 'tableView'
      });
    },
    render: function(col, resp, opt){
      if (opt && opt.source === 'tableView'){
        //make sure call is coming from the intended place
        console.log(middguard.state.activeModel);
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
          cell.contentEditable = true;
          j++;
        }
        resp.forEach(function(model, i){
          var row = table.insertRow(i+1);
          row.className = 'SQLRow';
          var j = 0;
          for (var attr in model){
            var cell = row.insertCell(j);
            cell.innerHTML = model[attr];
            cell.contentEditable = true;
            j++;
          }
        });
      }
      return this;
    }
    
    
  });

  middguard.addModule('TableView', TableView);
})();