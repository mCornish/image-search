const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
// const server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
// const db = new mongo.Db('urlsdb', server);
//const MONGO_URL = process.env.MONGOLAB_URI;
const MONGO_URL = '127.0.0.1:54137';

const fetch = require('node-fetch');

const populateDb = require('./populate-db');

const API_KEY = 'AIzaSyAUNNcfbS7-gf2hxJ1jt-LVIDU0wNuTjMY';
const ENGINE_ID = '002380537691482816554:nghhnm458ec';
const NUM_RESULTS = 10;
const REQUEST_BASE = `https://www.googleapis.com/customsearch/v1?cx=${ENGINE_ID}&num=${NUM_RESULTS}&searchType=image&key=${API_KEY}&q=`;

const _getResults = query => {
    const requestUrl = encodeURI(REQUEST_BASE + query);
    return fetch(requestUrl);
};

exports.addOne = (db, req, res) => {
    const query = req.params.query;
    //const resultsPromise = _getResults(query);
    db.collection('searches', (err, collection) => {
        const search = {
            "term": query,
            "created_at": new Date()
        };
        collection.insert(search, (err, doc) => {
            if (!err && doc) {
                console.log('Doc added: ', doc);
                _getResults(query)
                    .then(response => {
                        return response.json();
                    })
                    .then(json => {
                        console.log(json);
                        res.send(json);
                    })
                    .catch(ex => {
                        console.log('ERROR: ', ex);
                        res.send(ex);
                    });
            } else {
                res.json({'error': 'Unable to complete search'});
            }
        });
    });
}

exports.findRecent = (db, req, res) => {
    const url = req.params[0];
    db.collection('urls', (err, collection) => {
        const newUrl = {
            "original_url": url,
            "created_at": new Date() 
        }
        collection.insert(newUrl, {safe:true}, (err, result) => {
            if (!err) {
                console.log('Added doc: ', result);
                const doc = result.ops[0];
                const urlId = doc._id.toString().split('').filter((c, i) => i % 3 === 0).join(''); // Take every third char from _id
                doc['short_url'] = 'http://mc-short.herokuapp.com/' + urlId; 
                collection.update({'_id': doc._id}, doc, {safe:true}, (err, result) => {
                    if (!err) {
                        console.log('Updated doc: ' + result);
                        delete doc['_id'];
                        res.json(response);
                    } else {
                        console.log('ERROR:', err);
                        res.send({"error": "Unable to add URL"})
                    }
                });
            }
        })
    })
}
