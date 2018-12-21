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
    database: 'music',
    user: 'postgres'
};

// Create the database instance:
const db = pgp(config);

//prompt-promise
var prompt = require('prompt-promise');

var value = {name: ""};
const queryArtist = "INSERT INTO artists \
VALUES (default, ${name})";
const queryID = "SELECT id FROM artists WHERE name = ${name}";

function addArtist(){
    prompt('Artist: ')
    .then(function artist(val) {
        value.name = val;
        db.query(queryArtist, value).then(function (r) {
            db.query(queryID, value).then(function(r){
                console.log(`Created artist with id of: '${r[0].id}'`);
                prompt('Enter Another Artist? Enter Y/N\n')
                .then(function(val){
                    var answer = val;
                    if (answer == "y" || answer == "Y") {
                        addArtist();
                    } else {
                        console.log("Ok...goodbye then")
                        pgp.end();
                        prompt.done();
                    }
                })
            });
        });
    })
    .catch(function rejected(err) {
        console.log('error:', err.stack);
        pgp.end();
        prompt.finish();
    });
}

addArtist();

