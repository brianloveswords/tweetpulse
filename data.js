var sys = require('sys'),
    mongo = require('mongodb'),
    // local vars
    db = new mongo.Db('pulse', new mongo.Server('127.0.0.1', '27017', {}));

var getAllFromCollection = function(collection, callback) {
  db.open(function(){
    db.collection(collection, function(err, collection){
      collection.find({}, function(err, cursor){
        cursor.toArray(function(err, results){
          
          if (callback) callback(results);
          db.close();
        })
      })
    })
  })    
};

var getUsers = function(callback) {
  getAllFromCollection('user', callback);
};

var getTags = function(callback){
  getAllFromCollection('hashtag', callback);
}

exports.getTags = getTags;
exports.getUsers = getUsers;

