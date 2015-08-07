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
        if (globalThis.el.scrollHeight - scrollBottom <= 5 ) globalThis.table.addResults();
        
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
    
    template: '<h5>Query Entry</h5><div class="submission-div"><p class="query-beginning">SELECT * FROM %modelName% table WHERE:</p><div class="query-entry-div"><input type="text" id="query-text-%modelName%"class="query-text"/><input type="submit" id="query-submit-%modelName%" class="query-submit" value="Enter Query"><input type="submit" id="table-restore-%modelName%" class="table-restore" value="Restore Initial Table"></div></div>',
    
    events: {
      'click .query-submit': 'queryTrigger',
      'click .table-restore': 'restoreTable'
    },
    
    initialize: function(opts){
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      this.tableView = opts.tableView;
    },
    
    restoreTable: function(){
      this.tableView.numRows = 0;
      this.tableView.curQuery.offset = 0;
      this.tableView.curQuery.limit = 100;
      this.tableView.queryDB({}, false);
    },
    
    queryTrigger: function(){
      var qText = document.getElementById('query-text-' + this.model.get('name'));
      this.tableView.curQuery = {whereRaw: qText.value};
      this.tableView.curQuery.offset = 0;
      this.tableView.numRows = 0;
      this.tableView.curQuery.limit = 100;
      this.tableView.queryDB(this.tableView.curQuery, false);
    },
    
    render: function(){
      return this;
    }
    
  });

  var TableView = middguard.View.extend({
    template: '<h5>Current SQL Table/Results</h5><div class="upload"><h6 class="upload-header">Upload CSV Data:</h6><input class="csv-file" type="file" accept=".csv"><input class="file-upload" type="submit" value="Upload"><div class="dialog-box" id="dialog-box-%modelName%" title="Warning!" display="none"><p class="dialog-text" id="dialog-text-%modelName%" style="display:none">The data will only be uploaded correctly if each header column in the CSV file has the EXACT same name as a column in the database! (CSV file required to have a header)</p></div></div><div class="submit-restore-div"><input type="submit" class="enter-changes" class="submit-restore-%modelName%" id="enter-changes-%modelName%" value="Submit Changes" /><input type="submit" class="restore-edits" class="submit-restore-%modelName%" id="restore-%modelName%" value="Restore Edits" /></div><div class="table-changes" id="table-changes-%modelName%"><p class="model-name-text" id="%modelName%-model-name-text"></p></div><table id="%modelName%-table" class="SQL-table"></table>',
    
    className: 'table-view',
    
    events: {
      "click .file-upload": "uploadHandle"
    },
    
    initialize: function (opts) {
      var globalThis = this;
      this.model = opts.model;
      this.template = this.template.replace(/%modelName%/g, this.model.get('name'));
      this.$el.html(this.template);
      middguard.state.changedModels = {};
      this.curMax = 100;
      this.numRows = 0;
      this.full = false;
      this.curQuery = {};
      this.curQuery.offset = 0;
      this.curQuery.limit = 100;
      
      this.modName = this.model.get('name');
      this.collection = new Backbone.Collection([], {model: middguard.entities[this.capitalize(pluralize(this.modName))].model});
      this.collection.url = pluralize(this.modName);
      this.queryDB(this.curQuery, false);
      this.subtracted = false;
      _.extend(this, Backbone.Events);
      //added models can show up in the table view if they were added on the client (assuming they fit the right criteria),
      //but deleted models will not be removed from the table view unless they have been deleted on the server
      this.listenTo(middguard.entities[this.capitalize(pluralize(this.modName))], 'add', function(model, col, opt){
        globalThis.serverCreate(model.attributes, opt);
      });
      this.collection.ioBind('create', this.serverCreate, this);
      this.collection.ioBind('update', this.serverUpdate, this);
      this.collection.ioBind('delete', this.serverDelete, this);
    },
    
    serverCreate: function(data, opts){
      if (!this.collection.get(data.id) && data.id < this.curMax && !opts.success && !opts.error){
        //ensuring that the new query needs to be done and that this function hasn't been called from a 'fetch' call
        this.curQuery.limit = this.curMax;
        this.curQuery.offset = 0;
        this.queryDB(this.curQuery, false);
      } else if (this.collection.models.length === 0 && !opts.success && !opts.error){
        //if there is no data in the collection yet--intended for when user has just uploaded a CSV and we want it to show up
        this.curQuery.limit = this.curMax;
        this.curQuery.offset = 0;
        this.queryDB(this.curQuery, false);
      }
    },
    
    serverUpdate: function(data){
      var curModel = this.collection.get(data.id);
      var curModelEnt = middguard.entities[this.capitalize(pluralize(this.modName))].get(data.id);
      if (curModel){
        for (var attr in data){
          curModel.set(attr, data[attr]);
        }
      }
    },
    
    serverDelete: function(data, opts){
      if (this.collection.get(data.id)){
        //ensuring that the new query needs to be done and that this function hasn't been called from a 'fetch' call
        var query = _.clone(this.curQuery);
        this.curQuery.limit = this.curMax;
        this.curQuery.offset = 0;
        this.queryDB(query, false);
      }
    },
    
    uploadHandle: function(){
      //function sends file uploads to the server
      var globalThis = this;
      var file = $('.csv-file')[0].files[0];
      $('#dialog-text-' + this.model.get('name')).css('display', 'inline');
      $('#dialog-box-' + this.model.get('name')).dialog({
        modal: true,
        buttons: {
          'Upload' : function(){
            $( this ).dialog( "close" );
            middguard.socket.emit('filetransfer', {file: file, filename: file.name, modelname: globalThis.model.get('name')});
          },
          Cancel: function(){
            $( this ).dialog( "close" );
          }
        }
      });
    },
    
    addResults: function(){
      if (!this.full){
        this.curQuery.offset += 100;
        this.curMax += 100;
        this.curQuery.limit = 100;
      }
      this.queryDB(this.curQuery, true);
    },
    
    queryDB: function(query, extend){
      var globalThis = this;
      query.orderByRaw = 'id asc';
      if (!query.limit) query.limit = '100';
      if (! query.hasOwnProperty('offset')) query.offset = this.curOffset;
      if (!extend) this.numRows = 0;
      this.collection.fetch({
        data: query, source: 'tableView',
        remove: !extend,
        success: function(col, resp, opt){
          globalThis.render(resp, opt, 'nocollect');
          //we need to bind the listener for these buttons after the buttons have been added into the DOM
          $('#enter-changes-' +globalThis.model.get('name')).click(globalThis.enterChanges);
          $('#restore-' +globalThis.model.get('name')).click(function(){
            globalThis.restore(globalThis);
          });
        },
        error: function(e){
          console.log('failure');
          console.log(Error(e));
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
    
    injectRow: function(table, model, mode, insertNum){
      var globalThis = this;
      var row = table.insertRow(insertNum);
      if (mode === 'collect') model = model.attributes;
      var rowView = new RowView({model: model});
      row.className = 'SQLRow';
      var j = 0;
      for (var attr in model){
        var cell = row.insertCell(j);
        var cellView = new CellView(globalThis.collection, rowView, model, attr);
        cell.innerHTML = model[attr];
        cell.contentEditable = true;
        cell.className = 'table-cell';
        cellView.setElement(cell);
        cellView.$el.attr('id', globalThis.collection.url + '-' + model.id + '-' + String(attr).replace(/ /g, '-'));
        j++;
      }
    },

    render: function(baseData, opt, mode){
      var globalThis = this;
      this.opt = opt;
      if (opt && opt.source === 'tableView'){
        //make sure call is coming from the intended place
        var tableName = this.model.get('name');
        var $table = $('#' + this.model.get('name') + '-table');
        var table = document.getElementById(this.model.get('name') + '-table');
        
        var data = (mode === 'collect') ? baseData.models: baseData;
        if (opt.remove){
          //if the table is being replaced, not extended
          $('#' + this.model.get('name') + '-table tbody').remove();
          //don't show anything if there are no results
          if (data.length === 0) return $table.css('visibility', 'hidden');
      
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
          var header = (mode === 'collect') ? data[0].attributes: data[0];
          for (var attr in header){
            //list attribute names
            var cell = row.insertCell(j);
            cell.innerHTML = attr;
            cell.className = 'header-cell';
            cell.contentEditable = true;
            j++;
          }
        }
        
        var insertNum;
        data.forEach(function(model, i){
          insertNum = globalThis.numRows + 1;
          globalThis.injectRow(table, model, mode, insertNum);
          globalThis.numRows++;
        });
        
      }
      return this;
    }
  });
  
  var RowView = middguard.View.extend({
    template: _.template('<tr class="table-row"></tr>'),
    
    className: '', //overriding 'middguard-module' default
    
    initialize: function (modelObj){
      this.$el.html(this.template);
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
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
    
    initialize: function(collection, rowRef, model, attr){
      var globalThis = this;
      this.collection = collection;
      this.model = model;
      this.attr = attr;
      this.originalId = this.model.id;
      this.listenTo(this.collection.get(this.model.id), 'change:' + this.attr, function(item){
        globalThis.$el.html(item.get(globalThis.attr));
      });
      
    },
    
    capitalize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    trackChanges: function(){
      //apply the changed attribute to its model, store the model for future saving to DB
      this.$el.css('color', 'red');
      middguard.state.changedModels[this.collection.url + '-' + this.originalId + '-' + String(this.attr).replace(/ /g, '-')] = {
        collection: this.collection,
        restore: this.model[this.attr], 
        id: this.model.id, 
        attrName: this.attr
      };
    },
    
    render: function(){
      return this;
    }
    
  });
  
  middguard.SQLView =  {ctor: SQLView};
})();