var fs = require('fs'),
  path = require('path')
  knex = require('../../middguard/config/knex');
  env = require('../../middguard/config/settings').env,
  knexConfig = require('../../middguard/config/knex')[env],
  knex = require('knex')(knexConfig)
  Baby = require('babyparse');
  Converter = require('csvtojson').Converter;
  
  
  module.exports = function(Bookshelf, model, fileParam){
    //get every file in the 'data-load-files' directory
    //Bookshelf.model('locationCount').prototype.tableName;
    fs.readFile(path.join(__dirname, 'data-load-files', 'load-config.json'), 'utf8', function(err, data){
      
      //get info on how to interpret csv file from load config file
      var configData = JSON.parse(data);
      for (filename in configData){
        if (configData[filename].isNew){
          //only put CSV data into database if it hasn't been put there before
          
          if (configData[filename].tableName){
            //if user has specified a table to put data in
            readCSVFile(filename, configData[filename].tableName);
          } else if (Bookshelf.model(model)){
            //otherwise, just put data in database corresponding to
            //the model from whose view the data was uploaded
            readCSVFile(filename, Bookshelf.model(model).prototype.tableName);
          } else {
            console.log(Error('Unable to determine which database to enter data into'));
          }
          
          configData[filename].isNew = false;
        
          //rewrite 'load-config.json' file to ensure data isn't re-inserted to DB
          fs.writeFile(path.join(__dirname, 'data-load-files', 'load-config.json'), JSON.stringify(configData, null, '\t'), null, function(err){
            if (err) console.log('Error: Write failed, csv data from ' + filename + ' may be inserted into the database the next time middguard is run!')
          });
        }
      }
    });
  }
  
  function readCSVFile (filename, tablename){
    //write CSV data into database
    //translateReference contains translations of csv column names to DB column names
    
    var readStream = fs.createReadStream(path.join(__dirname, 'data-load-files', filename), {encoding: 'utf8'});
    /*
    -----UNDER CONSTRUCTION----
    var count = 0;
    var prevEnd = '';
    var bulk = '';
    var nextStart = '';
    */
    readStream.on('data', function(data){
      var lines = Baby.parse(data, {header: true}).data;
      lines.forEach(function(line, i){
        knex(tablename).insert(line).then(function(record){
          return;
        }).catch(function(error){
          console.log(Error(error));
        });
      });
    }).on('end', function(){
      console.log('Data Loaded Successfully');
    });
      
    /*  TO DO: WORK ON MAKING BIG FILES WORK!
    -----UNDER CONSTRUCTION----
    var startoff = data.indexOf('\n');
    var cutoff = data.lastIndexOf('\n');
    //debugger;
    //cut off the end of the previous chunk
    if (count !== 0){
      prevEnd = data.substr(0, startoff-1).trim();
    } else {
      prevEnd = '';
    }
    
    console.log('prevEnd: ' + prevEnd);
    
    //insert (end of the previous chunk + beginning of current chunk) into the DB
    if (prevEnd.length + nextStart.length){
      console.log('combo: ' + nextStart+prevEnd);
      var firstLine = Baby.parse(prevEnd+nextStart).data;
      knex(tablename).insert(firstLine).then(function(record){
        return;
      }).catch(function(error){
        console.log(Error(error));
      });
    }
    
    //cut off the end of the current chunk, use all the lines in the middle
    if (cutoff !== data.length-1) {
      bulk = data.substr(startoff, cutoff-1);
      nextStart = data.substr(cutoff).trim();
    } else {
      bulk = data.substr(startoff);
      nextStart = '';
    }
    console.log('nextStart: ' + nextStart);
    
    //insert all of the full lines into the DB
    if (bulk.length){
      var lines = Baby.parse(bulk, {header: true}).data;
      lines.forEach(function(line, i){
        knex(tablename).insert(line).then(function(record){
          return;
        }).catch(function(error){
          console.log(Error(error));
        });
      });
    }
    count++;
    */
      
  }