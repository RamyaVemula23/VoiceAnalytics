const express = require('express')
const route = require('./route');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
var app = express();
app.use(cors({ origin:'http://192.168.43.72:3000/'}));
const port = 4000;

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send("Home Page");
    console.log("Hiiiiiiiiiiii")
})

app.listen(port, () => {
    console.log(`Served started at port ${port}`);
    
    
}) 
app.use('/api', route)