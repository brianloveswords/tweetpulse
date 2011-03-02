var app = require('express').createServer(),
    sys = require('sys'),
    jade = require('jade');

app.get('/', function(req, res){
  res.send('hello world');
});

sys.puts('listening on port 3000');
app.listen(3000);

