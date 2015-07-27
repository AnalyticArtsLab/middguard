var middguard = middguard || {};

(function () {
  'use strict';
  
  var SQLView = middguard.View.extend({
    template: '<h3 style="margin:5px">"%modelName%" DB Table</h3><div class="table-view-wrapper">',
    
    className: 'SQLInteractDiv middguard-module',
    
    initialize: function(opts){
      this.model = opts.model
      this.$el.html(this.template.replace('%modelName%', this.model.get('name')));
      this.$el.attr('id', 'sql-model-view-' + this.model.get('name'));
      var globalThis = this;
      
      //create infinite scroll capability
      this.$el.scroll(function(){
        var scrollBottom = globalThis.$el.scrollTop() + globalThis.$el.height();
        if (scrollBottom/globalThis.el.scrollHeight > 0.9){
          globalThis.table.curOffset += 100;
          globalThis.table.queryDB(globalThis.table.curQuery, true);
        }
      })
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
    
    template: '<h5>Query Entry</h5><div class="submission-div"><p class="query-beginning">SELECT * FROM %modelName% table WHERE:</p><div class="query-entry-div"><input type="text" id="query-text-%modelName%"class="query-text"/><input type="submit" id="query-submit-%modelName%" class="query-submit" value="Enter Query"></div></div>',
    
    events: {
      'click .query-submit': 'queryTrigger'
    },
    
    initialize: function(opts){
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      this.tableView = opts.tableView;
    },
    
    queryTrigger: function(){
      var qText = document.getElementById('query-text-' + this.model.get('name'));
      this.tableView.curQuery = {whereRaw: qText.value};
      this.tableView.curOffset = 0;
      this.tableView.queryDB(this.tableView.curQuery, false);
    },
    
    render: function(){
      return this;
    }
    
  });

  var TableView = middguard.View.extend({
    template: '<h5>Current SQL Table/Results</h5><div class="table-changes" id="table-changes-%modelName%"><p class="model-name-text" id="%modelName%-model-name-text"> <- Select Model </p></div><table id="%modelName%-table" class="SQL-table"></table><div class="pagination" id="pagination-%modelName%"><input type="submit" class="paginate-button-prev" value="<< Previous Page"><input type="submit" class="paginate-button-next" value="Next Page >>"></div><div class="submit-restore-div"><input type="submit" class="enter-changes" class="submit-restore-%modelName%" id="enter-changes-%modelName%" value="Submit Changes" /><input type="submit" class="restore-edits" class="submit-restore-%modelName%" id="restore-%modelName%" value="Restore Edits" /></div>',
    
    events: {
      "click .paginate-button-next": "paginateNext",
      "click .paginate-button-prev": "paginatePrev"
    },
    
    className: 'table-view',
    
    initialize: function (opts) {
      var globalThis = this;
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      middguard.state.changedModels = {};
      this.curOffset = 0;
      this.numRows = 0;
      this.curQuery = {};
      
      var modName = this.model.get('name');
      this.collection = new Backbone.Collection([], {model: middguard.entities[this.capitalize(pluralize(modName))].model});
      this.collection.url = pluralize(modName);
      this.queryDB(this.curQuery, false);
      
    },
    
    paginateNext: function(){
      this.curOffset += 100;
      this.queryDB(this.curQuery, false);
    },
    
    paginatePrev: function(){
      this.curOffset -= 100;
      if (this.curOffset < 0){
        this.curOffset = 0;
      }
      this.queryDB(this.curQuery, false);
    },
    
    queryDB: function(query, extend){
      var globalThis = this;
      query.limit = '100';
      query.offset = this.curOffset;
      var lastRow = (extend) ? this.numRows: 0;
      this.collection.fetch({
        data: query, source: 'tableView',
        extend: extend,
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
        var current = middguard.state.changedModels[item];
        var model = current.collection.findWhere({id: current.id});
        var htmlString = $('#' + item).html().trim();
        if (current.attrName === 'id'){
          htmlString = parseInt(htmlString);
          if (isNaN(htmlString)){
            console.log(Error('id value must be a unique integer'));
            //globalThis.restore(globalThis);
          }
        }
        model.set(current.attrName, $('#' + item).html().trim());
        model.save();
        $('#' + item).css('color', 'black');
      }
      middguard.state.changedModels = {};
    },
    
    restore: function(globalThis){
      //restore all changes to models that haven't been saved
      for (var item in middguard.state.changedModels){
        var selection = $('#' + item);
        selection.html(middguard.state.changedModels[item].restore);
        selection.css('color', 'black');
      }
      middguard.state.changedModels = {};
    },

    render: function(col, resp, opt){
      var globalThis = this;
      if (opt && opt.source === 'tableView'){
        //make sure call is coming from the intended place

        var tableName = this.model.get('name');
        var $table = $('#' + this.model.get('name') + '-table');
        var table = document.getElementById(this.model.get('name') + '-table');
        
        if (!opt.extend){
          //if the table is being replaced, not extended
          $('#' + this.model.get('name') + '-table tbody').remove();
          //don't show anything if there are no results
          if (col.models.length === 0) return $table.css('visibility', 'hidden');
        
          if ($table.css('visibility') === 'hidden'){
            $table.css('visibility', 'visible');
          }
          
          var modNameText = document.getElementById(tableName + '-model-name-text');
          modNameText.innerHTML = 'Model: ' + tableName;
          modNameText.style['background-color'] = '#848484';
          modNameText.style['border-color'] = '#848484';
          modNameText.style.color = 'white';
          var row = table.insertRow(0);
          row.className = 'SQLRowHeader';
          var j = 0;        
          for (var attr in col.models[0].attributes){
            //list attribute names
            var cell = row.insertCell(j);
            cell.innerHTML = attr;
            cell.className = 'header-cell';
            cell.contentEditable = true;
            j++;
          }
          
        }
        
        col.models.forEach(function(model, i){
          var row = table.insertRow(globalThis.numRows + 1);
          var rowView = new RowView({model: model});
          //rowView.setElement(row);
          row.className = 'SQLRow';
          var j = 0;
          for (var attr in model.attributes){
            var cell = row.insertCell(j);
            var cellView = new CellView(globalThis.collection, model, attr);
            cell.innerHTML = model.get(attr);
            cell.contentEditable = true;
            cell.className = 'table-cell';
            cellView.setElement(cell);
            cellView.$el.attr('id', globalThis.collection.url + '-' + model.get('id') + '-' + String(attr).replace(/ /g, '-'));
            j++;
          }
          globalThis.numRows++;
        });
        
        var tableWidth = $(table).css('width');
        this.$el.css('width', tableWidth);
        $('#pagination-' + this.model.get('name')).css('width', tableWidth);
      }
      return this;
    }
  });
  
  var RowView = middguard.View.extend({
    template: _.template('<tr class="table-row"></tr>'),
    
    className: '', //overriding 'middguard-module' default
    
    initialize: function (modelObj){
      this.$el.html(this.template);
      this.model = modelObj.model;
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
      this.originalId = this.model.get('id');
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    trackChanges: function(){
      //apply the changed attribute to its model, store the model for future saving to DB
      this.$el.css('color', 'red');
      middguard.state.changedModels[this.collection.url + '-' + this.originalId + '-' + String(this.attr).replace(/ /g, '-')] = {
        collection: this.collection,
        restore: this.model.get(this.attr), 
        id: this.model.get('id'), 
        attrName: this.attr
      };
    },
    
    render: function(){
      return this;
    }
    
  });

  middguard.SQLView =  {ctor: SQLView};
})();