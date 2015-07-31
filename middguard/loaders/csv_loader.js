var fs = require('fs'),
  path = require('path')
  knex = require('../../middguard/config/knex');
  env = require('../../middguard/config/settings').env,
  knexConfig = require('../../middguard/config/knex')[env],
  knex = require('knex')(knexConfig);
  
  
  module.exports = function(){
    //get every file in the 'data-load-files' directory
    fs.readdir(path.join(__dirname, 'data-load-files'), function(err, files){
      files.forEach(function(filename){
        if (filename.charAt(0) !== '.' && filename !== 'load-config.json'){
          //prevent hidden files from being used
          
          fs.readFile(path.join(__dirname, 'data-load-files', 'load-config.json'), 'utf8', function(err, data){
            
            //get info on how to interpret csv file from load config file
            var configData = JSON.parse(data);
            if (configData[filename].isNew){
              //only put CSV data into dataabase if it hasn't been put there before
              readCSVFile (filename, configData[filename].tableName, configData[filename].translation)
              configData[filename].isNew = false;
              
              //rewrite 'load-config.json' file to ensure data isn't re-inserted to DB
              fs.writeFile(path.join(__dirname, 'data-load-files', 'load-config.json'), JSON.stringify(configData, null, '\t'), null, function(err){
                if (err) console.log('Error: Write failed, csv data from ' + filename + ' may be re-inserted into the database the next time middguard is run!')
              });
            }
          });
        }
      })
    });
  }
  
  function readCSVFile (filename, tablename, translateReference){
    //write CSV data into database
    //translateReference contains translations of csv column names to DB column names
    
    var readStream = fs.createReadStream(path.join(__dirname, 'data-load-files', filename), {encoding: 'utf8'});
    readStream.on('data', function(data){
      //console.log(data);
      var lines = data.split('\n');
      var header;
      lines.forEach(function(line, i){
        if (line.length){
          var splitLine = line.split(',');
          if (i === 0) {
            header = splitLine;
          } else {
            var curInsert = {};
            splitLine.forEach(function(item, index){
              var curProp = header[index];
              if (translateReference[curProp]){
                curInsert[translateReference[curProp]] = item;
              }
            });
            knex(tablename).insert(curInsert).then(function(record){
              return;
            });
          }
        }
      });
    });
  }