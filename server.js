var app = require('express').createServer(),
    sys = require('sys'),
    haml = require('hamljs'),
    tweetData = require('./data.js');

app.set('view engine', 'hamljs');

app.get('/', function(req, res){
  res.render('index');
});

app.get('/users', function(req, res){
  tweetData.getUsers(function(users){
    console.dir(users);
    return res.render('users', {locals: {users: users }});
  })
});

app.get('/tags', function(req, res){
  tweetData.getTags(function(tags){
    return res.render('users', {locals: {users: tags }});
  })
});

sys.puts('listening on port 3000');
app.listen(3000);
