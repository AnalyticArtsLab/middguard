var middguard = middguard || {};

(function () {
  'use strict';
  
  var SQLView = middguard.View.extend({
    template: _.template('<h3>SQL Database Interaction</h3>'),
    
    className: 'SQLInteractDiv middguard-module',
    
    initialize: function(opts){
      this.model = opts.model
      this.$el.html(this.template);
      this.$el.attr('id', 'sql-model-view-' + this.model.get('name'));
    },
    
    render: function(){
      this.table = new TableView({model: this.model});
      this.query = new QueryView({tableView: this.table, model: this.model});
      this.$el.append(this.query.render().el);
      this.$el.append(this.table.render().el);
      return this;
    }
  });
  
  
  var QueryView = middguard.View.extend({
    className: 'query-view',
    
    template: '<h5>Model Table Query Entry</h5><div class="submission-div"><p class="query-beginning">SELECT * FROM [model table name] WHERE:</p><div class="query-entry-div"><input type="text" id="query-text-%modelName%"class="query-text"/><input type="submit" class="query-submit" value="Add Query"></div></div>',
    
    events: {
      'click #query-submit': 'queryTrigger'
    },
    
    initialize: function(opts){
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      this.tableView = opts.tableView;
    },
    
    queryTrigger: function(){
      var qText = document.getElementById('query-text-' + this.model.get('name'));
      var modName = middguard.state.activeModel.current.model.get('name');
      modName = this.tableView.capitalize(pluralize(modName));
      this.tableView.queryDB({whereRaw: qText.value});
    },
    
    render: function(){
      return this;
    }
    
  });

  var TableView = middguard.View.extend({
    template: '<h5>Current SQL Table/Results</h5><div class="table-changes" id="table-changes-%modelName%"><p class="model-name-text" id="%modelName%-model-name-text"> <- Select Model </p></div><table id="%modelName%-table" class="SQL-table" "></table><div class="submit-restore-div"><input type="submit" class="enter-changes" class="submit-restore-%modelName%" id="enter-changes-%modelName%" value="Submit Changes" /><input type="submit" class="enter-changes" class="submit-restore-%modelName%" id="restore-%modelName%" value="Restore Edits" /></div>',
    
    className: 'table-view',
    
    
    initialize: function (opts) {
      var globalThis = this;
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      middguard.state.changedModels = {};
      
      var modName = this.model.get('name');
      this.collection = new Backbone.Collection([], {model: middguard.entities[this.capitalize(pluralize(modName))].model});
      this.collection.url = pluralize(modName);
      this.queryDB({limit: '5'});
      
    },
    queryDB: function(query){
      var globalThis = this;
      this.collection.fetch({
        data: query, source: 'tableView',
        success: function(col, resp, opt){
          globalThis.render(col, resp, opt);
          //we need to bind the listener for these buttons after the buttons have been added into the DOM
          $('#enter-changes-' +globalThis.model.get('name')).click(globalThis.enterChanges);
          $('#restore-' +globalThis.model.get('name')).click(function(){
            globalThis.restore(globalThis);
          });
        },
        error: function(){
          console.log('failure');
        }
      });
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    enterChanges: function(){
      var globalThis = this;
      //save all changed models to DB
      for (var item in middguard.state.changedModels){
        middguard.state.changedModels[item].collection.findWhere({id: middguard.state.changedModels[item].id}).save();
        $('#' + middguard.state.changedModels[item].cssId).css('color', 'black');
      }
      middguard.state.changedModels = {};
    },
    
    restore: function(globalThis){
      //save all changed models to DB
      
      for (var item in middguard.state.changedModels){
        var selection = $('#' + item);
        selection.html(middguard.state.changedModels[item]);
        selection.css('color', 'black');
        /*
        for (var attribute in item.attr){
          model.set(attribute, item.attr[attribute]);
          $('#' + middguard.state.changedModels[item].cssId).html(model.get)
        }
        model.save();
        $('#' + middguard.state.changedModels[item].cssId).css('color', 'black');
        selection.css('color', 'black');
        */
      }
      //globalThis.render(globalThis.collection);
    },

    render: function(col, resp, opt){
      var globalThis = this;
      if (opt && opt.source === 'tableView'){
        //make sure call is coming from the intended place

        var tableName = this.model.get('name'); 
        var modNameText = document.getElementById(tableName + '-model-name-text');
        modNameText.innerHTML = 'Model: ' + tableName;
        modNameText.style['background-color'] = '#848484';
        modNameText.style['border-color'] = '#848484';
        modNameText.style.color = 'white';
        var table = document.getElementById(this.model.get('name') + '-table');
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
            var cellView = new CellView(globalThis.collection, model, attr);
            cell.innerHTML = model[attr];
            cell.contentEditable = true;
            cell.className = 'table-cell';
            cellView.setElement(cell);
            cellView.$el.attr('id', globalThis.collection.url + '-' + model.id+ '-' + String(attr).replace(/ /g, '-'));
            j++;
          }
        });
      }
      return this;
    }
  });
  
  var RowView = middguard.View.extend({
    template: _.template('<tr class="table-row"></tr>'),
    
    className: '', //overriding 'middguard-module' default
    
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
    className: '', //overriding 'middguard-module' default
    
    initialize: function(collection, model, attr){
      this.collection = collection;
      this.model = model;
      this.attr = attr;
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    trackChanges: function(){
      //apply the changed attribute to its model, store the model for future saving to DB
      this.$el.css('color', 'red');
      middguard.state.changedModels[this.collection.url + '-' + this.model.id + '-' + String(this.attr).replace(/ /g, '-')] = this.model[this.attr];
    },
    
    render: function(){
      return this;
    }
    
  });

  middguard.SQLView =  {ctor: SQLView};
})();