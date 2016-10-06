const searches = [
    {
        "term": "Captain America",
        "created_at": new Date()
    }
]

module.exports = db => {
    db.collection('searches', (err, collection) => {
        collection.insert(searches, {safe: true});
    });
}
