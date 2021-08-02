const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const fiducialPointFinder = require('./modules/fiducial_point_finder');
const pointExplorer = require('./modules/point_explorer');
const pipeline = require('./modules/pipeline');
const app = express();

const AVALIABLE_CLOUDS_DIRECTORY = './avaliable_clouds';

app.use(express.static('public'));

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/avaliable-clouds', (req, res) => {
    const avaliableClouds = {};

    fs.readdirSync(AVALIABLE_CLOUDS_DIRECTORY).forEach(file => {
        if (fs.lstatSync(path.resolve(AVALIABLE_CLOUDS_DIRECTORY, file)).isDirectory()) {
            avaliableClouds[file] = [];
            fs.readdirSync(path.join(AVALIABLE_CLOUDS_DIRECTORY, file)).forEach(innerfile => {
                avaliableClouds[file].push(innerfile);
            });
        }
    });

    res.json(avaliableClouds);
});

app.get('/avaliable-clouds/:folder/:cloud', (req, res) => {
    res.sendFile(path.join(__dirname, AVALIABLE_CLOUDS_DIRECTORY, req.params.folder, req.params.cloud));
});

app.post('/point-analysis', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        const computationMethod = fields.computationMethod;
        const computationSize = fields.computationSize;
        const pointIndexToAnalyze = fields.pointIndexToAnalyze;

        try {
            const response = pointExplorer.getPointAnalysis(
                file.file.path,
                computationMethod,
                computationSize,
                pointIndexToAnalyze
            );

            fs.unlink(file.file.path, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                };

                res.json(response);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

app.post('/find-fiducial-point', (req, res, next) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        const filename = file.file.path;
        const flexibilizeThresholds = fields.flexibilizeThresholds === "true";
        const flexibilizeCrop = fields.flexibilizeCrop === "true";
        const computationRadiusOrKSize = fields.computationRadiusOrKSize;
        const computationMethod = fields.computationMethod;
        const minGaussianCurvature = fields.minGaussianCurvature;
        const shapeIndexLimit = fields.shapeIndexLimit;
        const minCropSize = fields.minCropSize;
        const maxCropSize = fields.maxCropSize;
        const minPointsToContinue = fields.minPointsToContinue;
        const removeIsolatedPointsRadius = fields.removeIsolatedPointsRadius;
        const removeIsolatedPointsThreshold = fields.removeIsolatedPointsThreshold;
        const nosetipSearchRadius = fields.nosetipSearchRadius;
        const gfSearchRadius = fields.gfSearchRadius;
        const features = fields.features;
        const featuresThreshold = fields.featuresThreshold;
        const fiducialPoint = fields.fiducialPoint;

        try {
            const response = fiducialPointFinder.findFiducialPoint(
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
                featuresThreshold,
                fiducialPoint
            );

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                res.status(200).json(response);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

app.post('/gaussian-curvature', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        const filename = file.file.path;
        const kdtreeMethod = fields.kdtreeMethod;
        const kdtreeValue = fields.kdtreeValue;
        const thresholdMin = fields.thresholdMin;
        const thresholdMax = fields.thresholdMax;

        try {
            const response = pipeline.gaussianCurvature(
                filename,
                kdtreeMethod,
                kdtreeValue,
                thresholdMin,
                thresholdMax
            );

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                res.status(200).json(response);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

app.post('/shape-index', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        const filename = file.file.path;
        const kdtreeMethod = fields.kdtreeMethod;
        const kdtreeValue = fields.kdtreeValue;
        const thresholdMin = fields.thresholdMin;
        const thresholdMax = fields.thresholdMax;

        try {
            const response = pipeline.shapeIndex(
                filename,
                kdtreeMethod,
                kdtreeValue,
                thresholdMin,
                thresholdMax
            );

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                res.status(200).json(response);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

app.post('/geometric-feature', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        const filename = file.file.path;
        const feature = fields.feature;
        const kdtreeMethod = fields.kdtreeMethod;
        const kdtreeValue = fields.kdtreeValue;
        const thresholdMin = fields.thresholdMin;
        const thresholdMax = fields.thresholdMax;
        const outputFilename = path.join(
            __dirname,
            'intermediary_clouds',
            `gf_${feature}_${filename.split('/')[filename.split('/').length-1]}`
        );

        try {
            const response = pipeline.geometricFeature(
                filename,
                feature,
                kdtreeMethod,
                kdtreeValue,
                thresholdMin,
                thresholdMax,
                outputFilename
            );

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                res.status(200).json(response);
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

const savePipelineConfig = (file, outputFilename, filters, error) => {
    const timestamp = new Date();
    const data = {
        file,
        outputFilename,
        filters,
        timestamp,
        error
    };

    fs.writeFile(path.join('log', `pipeline_${Date.now()}.json`), JSON.stringify(data, null, 4), 'utf8', err => {
        if (err) {
            console.error(err);
        }
    });
};

app.post('/filtering', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }

        let error = null;
        const filename = file.file.path;
        const outputFilename = fields.outputFilename ? path.join(__dirname, 'avaliable_clouds', 'filters', fields.outputFilename) : '';
        const filters = JSON.parse(fields.filters);

        try {
            const response = pipeline.applyFilters(filename, outputFilename, filters);

            fs.unlink(filename, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }

                res.status(200).json(response);
            });
        } catch (e) {
            console.error(e);
            error = e.message;
            res.status(500).json({ 'msg': e.message });
        }

        savePipelineConfig(filename, outputFilename, filters, error);
    });
    
});

app.post('/join-clouds', (req, res) => {
    const form = formidable({ multiples: true });

    form.on('fileBegin', (name, file) => {
        file.path = `./uploaded_files/${file.name}`;
    });

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            next(err);
            return;
        }
        
        const files = file.file.length ? file.file.map(f => f.path) : [file.file.path];
        const outputFilename = path.join(__dirname, 'avaliable_clouds', 'filters', fields.outputFilename);

        try {
            const response = pipeline.joinClouds(files, outputFilename);

            files.forEach(f => fs.unlink(f, error => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ 'msg': error.message });
                }
            }));

            res.status(200).json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 'msg': error.message });
        }
    });
});

app.listen(process.env.PORT || 3000, () => console.log('Server listening on 3000!'));
