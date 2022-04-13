const express = require('express')
const app = express()
var path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.use(express.static(__dirname));
app.listen(3000, () => console.log('Local dev version of app listening on port 3000!'));
