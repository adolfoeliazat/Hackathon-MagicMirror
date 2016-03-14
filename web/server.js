var express = require('express');
var app = express();
app.state = {};

// Angular app
app.use(express.static('dist'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/dist/index.html');
});

// Scan/recommend API
app.put('/api/scan/:productId', function(req, res) {
    app.state.requested = req.params.productId;
    res.send(app.state);
});

app.put('/api/recommend/:productId', function(req, res) {
    app.state.recommended = req.params.productId;
    res.send(app.state);
});

app.get('/api/scan', function(req, res) {
    res.send(app.state.requested);
});

app.get('/api/recommend', function(req, res) {
    res.send(app.state.recommended);
});

app.listen(3000, function () {
    console.log('Magic mirror app listening on port 3000!');
});
