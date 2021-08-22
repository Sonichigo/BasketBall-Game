const express = require('express');
var path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname,'/public')));


app.get('/', (request,response) => {
    response.sendFile(path.join(__dirname,'/public/index.html'));
});

app.listen(port , () => {
    console.log("Listening on express server ",port);
});