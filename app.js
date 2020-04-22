const express = require('express');
const app = express();

app.use(express.static('public'));
app.get('/favicon.ico', (req, res) => res.sendStatus(204));
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(3000);