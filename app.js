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
    
    const form = formidable({ multiples: true });
    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
          next(err);
          return;
        }
        
        let flexibilizeThresholds = fields.flexibilizeThresholds === "true";
        let flexibilizeCrop = fields.flexibilizeCrop === "true";
        let computationRadiusOrKSize = fields.computationRadiusOrKSize;
        let computationMethod = fields.computationMethod;
        let minGaussianCurvature = fields.minGaussianCurvature;
        let shapeIndexLimit = fields.shapeIndexLimit;
        let minCropSize = fields.minCropSize;
        let maxCropSize = fields.maxCropSize;
        let minPointsToContinue = fields.minPointsToContinue;
        let removeIsolatedPointsRadius = fields.removeIsolatedPointsRadius;
        let removeIsolatedPointsThreshold = fields.removeIsolatedPointsThreshold;
        let pointIndexToAnalyze = fields.pointIndexToAnalyze;
        
        let response = nosetip_finder.findNoseTip(
          file.file.path,
          flexibilizeThresholds,
          flexibilizeCrop,
          computationRadiusOrKSize,
          computationMethod,
          minGaussianCurvature,
          shapeIndexLimit,
          minCropSize,
          maxCropSize,
          minPointsToContinue,
          removeIsolatedPointsRadius,
          removeIsolatedPointsThreshold,
          pointIndexToAnalyze,
          );
        
        fs.unlink(file.file.path, (error) => {
          if(error) throw error;
          
          res.json(response);
        });
      });
});

app.listen(process.env.PORT || 3000);