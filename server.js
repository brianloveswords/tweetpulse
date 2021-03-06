var app = require('express').createServer(),
    sys = require('sys'),
    haml = require('hamljs'),
    tweetData = require('./data');

var helpers = {
  sprintf: require('sprintf').sprintf
}

app.set('view engine', 'hamljs');

app.get('/', function(req, res){
  res.render('index');
});
app.get('/users', function(req, res){
  tweetData.getUsers(function(users){
    return res.render('users', {locals: {users: users }});
  })
});
app.get('/user/:id', function(req, res){
  var user = req.params.id;
  tweetData.getTags(function(allTags){
    var plainTags = allTags.map(function(tag){return tag.tag});
    tweetData.getUser(user, function(user){
      var userTags = [];
      user.tweets.forEach(function(tweet){
        tweet.tags.forEach(function(tag){
          if (userTags.indexOf(tag) === -1) userTags.push(tag);
        })
      })
      return res.render('user', {locals: {user: user , tagsUsed: userTags, tagList: plainTags }});
    });
  });
});
app.get('/tags', function(req, res){
  tweetData.getTags(function(tags){
    return res.render('tags', {locals: {tags: tags }});
  })
});
app.get('/tag/:id', function(req, res){
  var tagname = req.params.id;
  tweetData.getTag(tagname, function(tag){
    return res.render('tag', {locals: {tag: tag }});
  });
});
app.get('/tagstats/:tags', function(req, res){
  var tags = req.params.tags.split('+');
  tweetData.getStatsForTags(tags, function(stats){
    return res.render('tagstats', {locals: { stats: stats }});
  });
})
sys.puts('listening on port 3000');
app.listen(3000);
