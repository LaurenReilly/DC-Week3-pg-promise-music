const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const promise = require('bluebird');

// pg-promise initialization options:
const initOptions = {
    // Use a custom promise library, instead of the default ES6 Promise:
    promiseLib: promise 
};

//has to be here since we created initOptions above. JS reads top to bottom!
const pgp = require('pg-promise')(initOptions);

// Database connection parameters(configs will always be different)
const config = {
    host: 'localhost',
    port: 5432,
    database: 'restaurant',
    user: 'postgres'
};

// Create the database instance:
const db = pgp(config);

//readline
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Artist: ", function(answer) {
    // TODO: Log the answer in a database
      let name = answer;
      var queryArtist = `INSERT INTO artists ("name") \
          VALUES('${name}')`;
      db.result(queryArtist).then(function(){
          rl.question("Album: ", function(answer) {
              name = answer;
              var queryAlbum = `INSERT INTO albums ("name") \
                  VALUES('${name}')`;
              db.result(queryAlbum).then(function(){
                  rl.close();
              })
          }) 
      })
  
  });