const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const nosetip_finder = require('./nosetip_finder');
const point_explorer = require('./point_explorer');
const app = express();

const AVALIABLE_CLOUDS_DIRECTORY = './avaliable_clouds';

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get("/avaliable-clouds", (req, res) => {
    const avaliableClouds = {};

    fs.readdirSync(AVALIABLE_CLOUDS_DIRECTORY).forEach(file => {
        if(fs.lstatSync(path.resolve(AVALIABLE_CLOUDS_DIRECTORY, file)).isDirectory()) {
            avaliableClouds[file] = [];
            fs.readdirSync(AVALIABLE_CLOUDS_DIRECTORY + "/" + file).forEach(innerfile => {
                avaliableClouds[file].push(innerfile);
            });
        }
    });

    res.json(avaliableClouds);
});

app.get("/avaliable-clouds/:folder/:cloud", (req, res) => {
    res.sendFile(__dirname + AVALIABLE_CLOUDS_DIRECTORY.substring(1) + "/" + req.params.folder + "/" + req.params.cloud);
});

app.post('/point-analysis', (req, res) => {
    const form = formidable({ multiples: true });
    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if(err) {
            next(err);
            return;
        }

        let computationMethod = fields.computationMethod;
        let computationSize = fields.computationSize;
        let pointIndexToAnalyze = fields.pointIndexToAnalyze;

        let response = point_explorer.getPointAnalysis(
            file.file.path,
            computationMethod,
            computationSize,
            pointIndexToAnalyze
            );

            fs.unlink(file.file.path, (error) => {
                if(error) throw error;

                res.json(response);
            });
        });
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

        let filename = file.file.path;
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
        let nosetipSearchRadius = fields.nosetipSearchRadius;
        let gfSearchRadius = fields.gfSearchRadius;
        let features = fields.features;
        let featuresThreshold = fields.featuresThreshold;

        try {
            let response = nosetip_finder.findNoseTip(
                filename,
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
                nosetipSearchRadius,
                gfSearchRadius,
                features,
                featuresThreshold
            );

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                return res.status(200).json(response);
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 'msg': error.message });
        }
    });
});

app.post('/find-nosetip/:folder/:filename', (req, res, next) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, file) => {
        if (err) {
            next(err);
            return;
        }

        let filePath = `./avaliable_clouds/${req.params.folder}/${req.params.filename}`;
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
        let nosetipSearchRadius = fields.nosetipSearchRadius;
        let gfSearchRadius = fields.gfSearchRadius;
        let features = fields.features;
        let featuresThreshold = fields.featureThresholds;

        let response = await nosetip_finder.findNoseTip(
            filePath,
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
            nosetipSearchRadius,
            gfSearchRadius,
            features,
            featuresThreshold
        );

        res.json(response);
    });
});

app.listen(process.env.PORT || 3000);
