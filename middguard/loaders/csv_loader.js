var fs = require('fs'),
  path = require('path')
  knex = require('../../middguard/config/knex');
  env = require('../../middguard/config/settings').env,
  knexConfig = require('../../middguard/config/knex')[env],
  knex = require('knex')(knexConfig)
  Baby = require('babyparse');
  
  
  module.exports = function(Bookshelf, model){
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
            readCSVFile(filename, configData[filename].tableName, configData[filename].translation)
          } else if (Bookshelf.model(model)){
            //otherwise, just put data in database corresponding to
            //the model from whose view the data was uploaded
            readCSVFile(filename, Bookshelf.model(model).prototype.tableName, configData[filename].translation)
          }
          configData[filename].isNew = false;
        
          //rewrite 'load-config.json' file to ensure data isn't re-inserted to DB
          fs.writeFile(path.join(__dirname, 'data-load-files', 'load-config.json'), JSON.stringify(configData, null, '\t'), null, function(err){
            if (err) console.log('Error: Write failed, csv data from ' + filename + ' may be re-inserted into the database the next time middguard is run!')
          });
        }
      }
    });
  }
  
  function readCSVFile (filename, tablename, translateReference){
    //write CSV data into database
    //translateReference contains translations of csv column names to DB column names
    
    var readStream = fs.createReadStream(path.join(__dirname, 'data-load-files', filename), {encoding: 'utf8'});
    readStream.on('data', function(data){
      var lines = Baby.parse(data, {header: true}).data;
      lines.forEach(function(line, i){
        knex(tablename).insert(line).then(function(record){
          return;
        }).catch(function(error){
          console.log(Error(error));
        });
      });
    });
  }