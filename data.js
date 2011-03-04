var sys = require('sys'),
    mongo = require('mongodb'),
    // local vars
    db = new mongo.Db('pulse', new mongo.Server('127.0.0.1', '27017', {}));

var getFromCollection = function(collection, term, callback, post_process) {
  post_process = (post_process || function(r){return r});
  db.open(function(){
    db.collection(collection, function(err, collection){
      collection.find(term, function(err, cursor){
        cursor.toArray(function(err, results){
          db.close(); // close the connection before calling back
          callback(post_process(results));
        })
      })
    })
  })    
};

var getUsers = function(callback) {
  /* this is really inefficient, I need to make a better document structure */
  getFromCollection('user', {}, callback, function(users){
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

var getUser = function(name, callback){
  getFromCollection('user', {screen_name: name}, callback, function(userTweets){
    return {
      screen_name: name,
      tweets: userTweets.map(function(userTweet){
        return userTweet.tweet
      })
    }
  });
}

var getTags = function(callback){
  getFromCollection('hashtag', {}, callback, function(tags){
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
var getTag = function(name, callback){
  getFromCollection('hashtag', {tag: name}, callback, function(tagTweets){
    return {
      tag: name,
      tweets: tagTweets.map(function(tagTweet){
        return tagTweet.tweet
      })
    }
  })
}
var getStatsForTags = function(tags, callback) {
  getTags(function(tagTweets){
    var tagsWithData = tagTweets.filter(function(tagTweet){
      return (tags.indexOf(tagTweet.tag) > -1);
    });
    var tagStats = tagsWithData.map(function(tag){
      var uniques = [];
      tag.tweets.forEach(function(tweet){
        if (uniques.indexOf(tweet.screen_name) == -1) uniques.push(tweet.screen_name);
      })
      return {
        name: tag.tag,
        totalTweets: tag.tweets.length,
        uniqueTweeters: uniques
      };
    });
    
    callback({
      tags: tagStats
    })
  });
}


exports.getTags = getTags;
exports.getTag = getTag;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getStatsForTags = getStatsForTags;
