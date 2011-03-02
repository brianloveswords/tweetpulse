var app = require('express').createServer(),
    sys = require('sys'),
    haml = require('hamljs'),
    tweetData = require('./data');

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
  tweetData.getUser(user, function(user){
    return res.render('user', {locals: {user: user }});
  });
});

app.get('/tags', function(req, res){
  tweetData.getTags(function(tags){
    return res.render('tags', {locals: {tags: tags }});
  })
});

sys.puts('listening on port 3000');
app.listen(3000);
