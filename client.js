var TwitterNode = require('twitter-node').TwitterNode,
    settings = require('./settings').settings,
    sys = require('sys'),
    winston = require('winston');

var twit = new TwitterNode({
  user: settings.username,
  password: settings.password,
  track: settings.track,
})

winston.add(winston.transports.File, { filename: 'dml-tweets.log' });

var setup = function () {
  twit.headers['User-Agent'] = 'DML Game Follower';
  
  twit.addListener('error', function(error){
    winston.error(error.message);
  
  }).addListener('tweet', function(tweet){
    winston.info('@' + tweet.user.screen_name + ': ' + tweet.text);
    console.dir(tweet);
    console.dir(getHashtagsFromTweet(tweet));
  
  }).addListener('end', function(resp) {
    winston.info("disconnected: " + resp.statusCode);
  });
}
var begin = function () {
  winston.info("Let's do this!");
  // start streaming event loop
  twit.stream();
}

var getHashtagsFromTweet = function(tweet){
  return tweet.entities.hashtags.map(function(obj){
    return obj.text;
  })
}

setup();
begin();
