var sys = require('sys'),
    mongo = require('mongodb'),
    // local vars
    db = new mongo.Db('pulse', new mongo.Server('127.0.0.1', '27017', {}));

var getAllFromCollection = function(collection, callback, post_process) {
  post_process = (post_process || function(r){return r});
  db.open(function(){
    db.collection(collection, function(err, collection){
      collection.find({}, function(err, cursor){
        cursor.toArray(function(err, results){
          callback(post_process(results));
          db.close();
        })
      })
    })
  })    
};

var getUsers = function(callback) {
  /* this is really inefficient, I need to make a better document structure */
  getAllFromCollection('user', callback, function(users){
    var tweetMap = {};
    var userArr = [];
    users.forEach(function(user){
      var userTweets = tweetMap[user.screen_name];
      if (!userTweets) {
        userTweets = tweetMap[user.screen_name] = [];
      }
      userTweets.push(user.tweet);
    });
    for (user in tweetMap) {
      userArr.push({screen_name: user, tweets: tweetMap[user]});
    }
    return userArr.sort(function(a,b){
      return b.tweets.length - a.tweets.length;
    });
  });
};

var getTags = function(callback){
  getAllFromCollection('hashtag', callback, function(tags){
  /* this is really inefficient, I need to make a better document structure */
    var tweetMap = {};
    var tagArr = [];
    tags.forEach(function(tag){
      var tagTweets = tweetMap[tag.tag];
      if (!tagTweets) {
        tagTweets = tweetMap[tag.tag] = [];
      }
      tagTweets.push(tag.tweet);
    });
    for (tag in tweetMap) {
      tagArr.push({tag: tag, tweets: tweetMap[tag]});
    }
    return tagArr.sort(function(a,b){
      return b.tweets.length - a.tweets.length;
    });
  });
}

exports.getTags = getTags;
exports.getUsers = getUsers;

