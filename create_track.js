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
//seems like I needed to add default in the spaces where other columns we aren't collecting data from would exist in the schema. it appears that you must update everything with some kind of value in order or the computer gets confused.
var value = {name: "", duration: 0, album_id: 0};
const queryTracks = "INSERT INTO tracks \
VALUES (default, ${name}, default, ${album_id}, default, ${duration}, default)";
const queryID = "SELECT id FROM tracks WHERE name = ${name}";

//after each prompt the users input is stored under the key in the value object
//when all keys have been filled with data the query and the object are passed to the db.query method
//the result is returned as an array storing any returned rows (which are stored as objects) referencing the id key of the object in the 0th array index gives us the id of our returned track

function addTrack(){
    prompt('Track: ')
    .then(function (val) {
    value.name = val;
    prompt('Album ID: ')
    .then(function(val){
        value.album_id = val;
        prompt('Duration: ')
        .then(function(val){
            value.duration = val;
            db.query(queryTracks, value).then(function (r) {
                db.query(queryID, value).then(function(r){
                    console.log(`Created Track with id of: '${r[0].id}'`);
                    prompt('Enter Another Track? Enter Y/N\n')
                    .then(function(val){
                        var answer = val;
                        if (answer == "y" || answer == "Y") {
                            addTrack();
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

addTrack();
