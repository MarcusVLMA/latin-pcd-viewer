const express = require('express');
const fs = require('fs')
const formidable = require('formidable')
const nosetip_finder = require('./nosetip_finder')
const app = express();

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/find-nosetip', (req, res, next) => {
    const form = formidable({ multiples: false });
    
    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
          next(err);
          return;
        }
        let response = nosetip_finder.findNoseTip(file.file.path);
        
        fs.unlink(file.file.path, (error) => {
          if(error) throw error;
          
          res.json(response);
        });
      });
});

app.listen(process.env.PORT || 3000);