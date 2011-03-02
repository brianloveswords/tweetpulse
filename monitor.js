var TwitterNode = require('twitter-node').TwitterNode,
    settings = require('./settings').settings,
    sys = require('sys'),
    winston = require('winston'),
    mongo = require('mongodb');

var twit = new TwitterNode({
  user: settings.username,
  password: settings.password,
  track: settings.track
});
var db = new mongo.Db('pulse', new mongo.Server('127.0.0.1', '27017', {}));

var start_stream = function () {
  winston.info("Let's do this!");
  twit.stream();
}

var getHashtagsFromTweet = function(tweet){
  return tweet.entities.hashtags.map(function(obj){
    return obj.text.toLowerCase();
  })
}

db.open(function(err, client){
  var is_setup = null;
  var hash_col = null;
  var user_col = null;
  
  var continue_execution = function(){
    if ( !(is_setup && hash_col && user_col) ) return false;
    sys.puts('setup and found collections');
    start_stream();
    return true;
  };
  
  var tweet_parser = function(tweet) {
    var user = tweet.user.screen_name;
    var tags = getHashtagsFromTweet(tweet);
    var text = '';
    if (tweet.retweeted_status) {
      text = tweet.retweeted_status.text;
    } else {
      text = tweet.text;
    }

    if (tags.length > 0) {
      tags.forEach(function(tag){
        var tag_entry = {'tag' : tag, 'tweet' : {'screen_name': user, 'tweet': text } };
        hash_col.insert(tag_entry, function(err, docs){
          if (err) console.dir(err);
        });
      });
    }
    
    var user_entry = {'screen_name': user, 'tweet' : {'text': text, 'tags': tags }};
    user_col.insert(user_entry, function(err, docs){
      if (err) console.dir(err);
    });
  }
  
  // setup stuff
  db.createCollection('hashtag', function(err, collection){
    console.log('ready with hashtag');
    hash_col = collection;
    continue_execution();
  });
  db.createCollection('user', function(err, collection){
    console.log('ready with user');
    user_col = collection;
    continue_execution();
  });
  var prepare_stream_watcher = (function () {
    winston.add(winston.transports.File, {filename: 'status.log'});
    twit.headers['User-Agent'] = 'DML Game Follower';
    twit.addListener('error', function(error){
      winston.error(error.message);
    }).addListener('tweet', function(tweet){
      winston.info('@' + tweet.user.screen_name + ': ' + tweet.text);
      tweet_parser(tweet);
    }).addListener('end', function(resp) {
      winston.info("disconnected: " + resp.statusCode);
    });
    is_setup = true;
    continue_execution();
  })();
});

