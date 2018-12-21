const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const promise = require('bluebird');

// pg-promise initialization options:
const initOptions = {
    // Use a custom promise library, instead of the default ES6 Promise:
    promiseLib: promise 
};

const pgp = require('pg-promise')(initOptions);

// Database connection parameters(configs will always be different)
const config = {
    host: 'localhost',
    port: 5432,
    database: 'music',
    user: 'postgres'
};

// Create the database instance:
const db = pgp(config);

//prompt-promise
var prompt = require('prompt-promise');

//the value object's keys correspond to the column names in the DB
//the template literals in the postgresql query correspond to the keys in the value object
var value = {name: "", year: 0, artist_id: 0};
const queryAlbums = "INSERT INTO albums \
VALUES (default, ${name}, ${year}, ${artist_id})";
const queryID = "SELECT id FROM albums WHERE name = ${name}";

//after each prompt the users input is stored under the key in the value object
//when all keys have been filled with data the query and the object are passed to the db.query method
//to get the value of the new entry the music db is queried where the album name matches the name value stored in the value object.
//the result is returned as an array storing any returned rows (which are stored as objects) referencing the id key of the object in the 0th array index gives us the id of our returned album 
function addAlbum(){ 
    prompt('Album: ')
    .then(function (val) {
    value.name = val;
    prompt('Year: ')
    .then(function(val){
        value.year = val;
        prompt('Artist Id: ')
        .then(function(val){
            value.artist_id = val;
            db.query(queryAlbums, value).then(function (r) {
                db.query(queryID, value).then(function(r){
                    console.log(`Created Album with id of: '${r[0].id}'`);
                    prompt('Enter Another Track? Enter Y/N\n')
                    .then(function(val){
                        var answer = val;
                        if (answer == "y" || answer == "Y") {
                            addAlbum();
                        } else {
                            console.log("Ok...goodbye then")
                            pgp.end();
                            prompt.done();
                        }
                    });
                });
            });
        });
    });
    })
    .catch(function rejected(err) {
    console.log('error:', err.stack);
    pgp.end();
    prompt.finish();
    });
}

addAlbum();