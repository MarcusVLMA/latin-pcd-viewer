import * as THREE from './node_modules/three/build/three.module.js';
import { PCDLoader } from './node_modules/three/examples/jsm/loaders/PCDLoader.js';
import { TrackballControls} from './node_modules/three/examples/jsm/controls/TrackballControls.js';
// import { OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js';
// import { TransformControls} from './node_modules/three/examples/jsm/controls/TransformControls.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { ColorGUIHelper, SizeGUIHelper } from './helpers/index.js';
import * as btn from './buttons.js';
import { filterMap, inverseFilterMap} from './maps.js';
import { createFilterDiv } from './filters.js';
// import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

let fileCounter = 0;

const center = new THREE.Vector3(0, 0, 0);

const collapsibles = document.querySelectorAll('.custom-collapsible');
const removeFilters = document.querySelectorAll('.remove-filter');
const filtersInput = document.getElementById('filters-input');
const addFilterButton = document.getElementById('add-filter');
const pipelineContainer = document.querySelector('.pipeline-container')
const allFilters = Object.keys(filterMap).map(filter => filter);
const avaliableFilters = [];
const currentFilters = [...avaliableFilters];
const items = document.querySelectorAll('.pipeline-filter');
let dragSrcEl = null;
const performFilteringButton = document.getElementById('performFiltering');
const descriptionTextArea = document.getElementById('filterDescription');
const saveResultsFilters = document.getElementById('saveResultsFilters');
const saveResultsJoinedClouds = document.getElementById('saveResultsJoinedClouds');
const outputJoinedCloudFilename = document.getElementById('outputFilenameMerge')

const filtersDatalist = document.getElementById('filters');
let filtersDatalistOptions = '';
allFilters.forEach(filter => {
    filtersDatalistOptions += '<option value="' + filter + '">';
});
filtersDatalist.innerHTML = filtersDatalistOptions;

// checkboxes
// const clearSceneCheckbox = document.getElementById('clearSceneCheckbox');
const featuresCheckboxes = document.querySelectorAll('input[type="checkbox"][data-feature]');

// inputs
// const featuresThresholdInput = document.getElementById('featuresThreshold');

const pointXYZInput = document.getElementById('pointXYZ');
const pointXYZSelectButton = document.getElementById('pointXYZSelect');

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const fov = 50; const aspect = 2; const near = 0.1; const far = 10000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const mouse = new THREE.Vector2();
const controls = new TrackballControls(camera, renderer.domElement);
const scene = new THREE.Scene();
// const stats = new Stats();

// document.getElementById('stats').appendChild(stats.dom);

let intersection = null;
const pointer = new THREE.Vector2();
const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

const inputFile = document.getElementById('pcdInputFile0');
const gui = new GUI();
const loader = new PCDLoader();

const raycaster = new THREE.Raycaster();
const focusRaycaster = new THREE.Raycaster();

let pcdFile = {};
let cloudLogFiles = [];
let multiplesPoints = [];
let runningRaycaster = false;
let multipleRunningRaycaster = false;
let runningFocusRaycaster = false;
let selectedNosetipCloud = {};
let neighborhoodCloud = {};
let pointAnalysis = {};

function init() {
    addEventListeners();
    loadAvaliableClouds();

    // controls settings
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 2;
    controls.panSpeed = 0.5;
    controls.staticMoving = true;

    scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1));

    raycaster.params.Points.threshold = 0.5;
    focusRaycaster.params.Points.threshold = 10;
}

function animate() {
    requestAnimationFrame(animate);
    // stats.update();
    render();
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
        renderer.setSize(width, height, false);
    }

    return needResize;
}

function render() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;

        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    raycaster.setFromCamera(pointer, camera);

    if ((pcdFile.cloud && runningRaycaster) || (pcdFile.cloud && multipleRunningRaycaster)) {
        const intersections = raycaster.intersectObjects([pcdFile.cloud]);
        intersection = intersections.length > 0 ? intersections[0] : null;

        if (intersection !== null) {
            sphere.position.copy(intersection.point);
            sphere.scale.set(1, 1, 1);
        }

        sphere.scale.multiplyScalar(0.98);
        sphere.scale.clampScalar(5, 1);
    }

    controls.update();
    renderer.render(scene, camera);
}

function addEventListeners() {
    // raycaster selected point
    document.addEventListener('pointermove', onPointerMove);

    btn.findFiducialPointButton.addEventListener('click', findFiducialPoint);
    btn.selectPointButton.addEventListener('click', toggleRaycaster);
    btn.selectMultiplePointsButton.addEventListener('click', multiplePointsRaycaster);
    btn.analysisPointButton.addEventListener('click', getPointAnalysis)
    btn.downloadButton.addEventListener('click', download);
    btn.downloadMultiplePointsButton.addEventListener('click', downloadMultiplePoints);

    [...featuresCheckboxes].forEach(c => c.addEventListener('change', e => {
        e.currentTarget.timeval = new Date().getTime();
    }));

    document.getElementById(`pcdInputFile0Color`).addEventListener('change', e => {
        colorHandler(e, 'file-0');
    });
    document.getElementById(`pcdInputFile0Slider`).addEventListener('change', e => {
        sizeHandler(e, 'file-0');
    });
    document.getElementById(`pcdInputFile0Hide`).addEventListener('click', e => {
        toggleVisibilityHandler(e, 'file-0');
    });
    document.getElementById(`pcdInputFile0Remove`).addEventListener('click', e => {
        if (document.getElementById(`pcdInputFile0Filename`).innerHTML === 'Upload') return;
        removeCloudFilter(e, 'file-0');
        if (document.getElementsByClassName('load-image-block').length >= 2) {
            document.getElementById('upload-cloud-0').innerHTML = '';
        }
    });

    inputFile.addEventListener('change', uploadCloudWrapper);

    btn.clearSceneButton.addEventListener('click', cleanScene);

    // select point on keydown
    // document.addEventListener('keydown', e => {
    //     if (e.key === 's' || e.key === 'S') {
    //         toggleRaycaster();
    //     }
    // }, false);

    [...collapsibles].forEach(coll => coll.addEventListener('click', collapse));

    [...removeFilters].forEach(filter => filter.addEventListener('click', removeFilter));

    addFilterButton.addEventListener('click', () => {
        const label = filtersInput.value;

        if (!label) {
            alert('Filtro não selecionado!');
            return;
        }

        if (currentFilters.includes(label)) {
            alert('Filtro já aplicado!');
            return;
        }

        if (!allFilters.includes(label)) {
            alert('Filtro não existe! Por favor, escolha outro.');
            return;
        }

        const filter = filterMap[label];
        addFilter(label, filter.name, filter.minThreshold, filter.maxThreshold);
        filtersInput.value = '';
    });

    items.forEach(item => { dragAndDropHandlers(item) });

    performFilteringButton.addEventListener('click', applyFiltering);

    avaliableFilters.forEach(filter => {
        setChangeEvents(filterMap[filter].name);
    });

    document.getElementById('config').addEventListener('change', loadConfiguration);
}

function uploadCloudWrapper(e) {
    this.removeEventListener('change', uploadCloudWrapper);
    this.addEventListener('change', e => {
        const counter = this.id.replace(/^\D+/g, '');
        removeCloudFilter(e, `file-${counter}`);
        uploadCloud(e, counter, false);
    });
    uploadCloud(e);
}

function uploadCloud(e, counter = fileCounter, insertNext = true) {
    const color = document.getElementById(`pcdInputFile${counter}Color`).value;
    const size = document.getElementById(`pcdInputFile${counter}Slider`).value;
    const pcdBlob = URL.createObjectURL(e.currentTarget.files[0]);
    const filename = e.currentTarget.files[0].name;
    const cloudName = `file-${counter}`;

    uploadPCDFile(pcdBlob, filename, cloudName, color, size);

    document.getElementById(`pcdInputFile${counter}Filename`).innerHTML = filename;
    document.getElementById(`pcdInputFile${counter}Filename`).setAttribute('title', filename);

    if (insertNext) {
        insertNextChild();
    }
}

function insertNextChild() {
    const div = document.getElementsByClassName('load-image')[0];

    fileCounter += 1;
    const cloudName = `file-${fileCounter}`;

    const child = document.createElement('div');
    child.classList.add('load-image-block', 'w-100', 'd-flex', 'align-items-center');
    child.innerHTML = `
        <div class="upload-cloud w-40 d-flex align-items-center">
            <label for="pcdInputFile${fileCounter}" class="d-flex align-items-center">
                <i class="fas fa-upload"></i>
                <span id="pcdInputFile${fileCounter}Filename">Upload</span>
            </label>
            <input id="pcdInputFile${fileCounter}" type="file" name="pcdInputFile${fileCounter}" accept=".pcd">
        </div>
        <div class="d-flex mt-2 justify-content-end align-items-center w-100">
            <div class="d-flex align-items-center">
                <label for="pcdInputFile${fileCounter}Color" class="form-label font-weight-bold">Color:</label>
                <input type="color" class="form-control form-control-color mx-2" role="button" id="pcdInputFile${fileCounter}Color" value="#1105ad" title="Escolhar a cor da nuvem">
                <label for="pcdInputFile${fileCounter}Slider" class="form-label font-weight-bold">Size:</label>
                <input type="number" min="0" max="10" class="form-control form-control mx-2" id="pcdInputFile${fileCounter}Slider" value="0.8" step="0.1" min="0" title="Escolhar o tamanho dos pontos da nuvem">
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-secondary mx-2" id="pcdInputFile${fileCounter}Hide" title="Show/hide">
                    <i class="far fa-eye"></i>
                </button>
                <button class="btn btn-danger" id="pcdInputFile${fileCounter}Remove" title="Remover nuvem">
                    <i class="fas fa-minus-circle"></i>
                </button>
            </div>
        </div>
    `;
    div.appendChild(child);

    document.getElementById(`pcdInputFile${fileCounter}Color`).addEventListener('change', e => {
        colorHandler(e, cloudName);
    });
    document.getElementById(`pcdInputFile${fileCounter}Slider`).addEventListener('change', e => {
        sizeHandler(e, cloudName);
    });
    document.getElementById(`pcdInputFile${fileCounter}Hide`).addEventListener('click', e => {
        toggleVisibilityHandler(e, cloudName);
    });
    document.getElementById(`pcdInputFile${fileCounter}Remove`).addEventListener('click', e => {
        removeCloudFilter(e, cloudName);
        if (document.getElementsByClassName('load-image-block').length >= 2) {
            child.innerHTML = '';
        }
    });
    document.getElementById(`pcdInputFile${fileCounter}`).addEventListener('change', uploadCloudWrapper);
}

function loadConfiguration(e) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);

        if (data.error) {
            alert("Arquivo de configuração com erro!");
            return;
        }

        $('.pipeline-filter').remove();
        currentFilters.length = 0;

        descriptionTextArea.value = data.description;

        data.filters.forEach(filter => {
            const label = inverseFilterMap[filter.filterName].label;
            addFilter(label, filter.filterName, filter.minThreshold, filter.maxThreshold, filter.kdtreeMethod === 'radius');
        });

        e.target.value = '';
    }

    reader.readAsText(event.target.files[0]);
}

btn.mergeButton.addEventListener('click', joinClouds);
document.getElementById('joinClouds').addEventListener('change', e => {
    const filename = e.target.files[0].name.split('.')[0];
    outputJoinedCloudFilename.value = `merged_${filename}_${Date.now()}.pcd`;
});

async function joinClouds() {
    const files = [...document.getElementById('joinClouds').files];
    if (!files.length) {
        return;
    }

    let outputFilename = outputJoinedCloudFilename.value;
    if (!outputFilename) {
        alert('Nome do arquivo obrigatório!');
        return
    }

    if (!outputFilename.endsWith('.pcd')) {
        outputFilename += '.pcd';
    }

    const formData = new FormData();

    for (const file of files) {
        const inputUrl = URL.createObjectURL(file);
        const sendBlob = await fetch(inputUrl).then(blob => blob.blob());
        const randomFilename = Math.random().toString(36).substring(7) + '.pcd';
        const sendFile = new File([sendBlob], randomFilename);

        formData.append('file', sendFile);
    }

    formData.append('outputFilename', outputFilename);
    formData.append('filename', files[0].name);
    formData.append('saveResults', saveResultsJoinedClouds.checked);

    showLoading(btn.mergeButton, btn.mergeButtonLoading);

    const response = await fetch('http://localhost:3000/join-clouds', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    hideLoading(btn.mergeButton, btn.mergeButtonLoading);

    if (!response.ok) {
        alert('Algum erro aconteceu: ' + data.msg);
        return;
    }

    insertJoinedClouds(data, outputFilename);
}

function insertJoinedClouds(clouds, filename) {
    const div = document.getElementsByClassName('joined-clouds')[0];
    div.innerHTML = '';

    const files = [...document.getElementById('joinClouds').files];
    clouds.intermediary_clouds = clouds.intermediary_clouds.map((cloud, i) => {
        return {
            cloud: cloud.cloud,
            cloud_label: files[i].name
        };
    });

    const _clouds = [{ cloud: clouds.cloud, cloud_label: filename }, ...clouds.intermediary_clouds];

    _clouds.forEach(({ cloud, cloud_label }, i) => {
        let size = 2;
        let color = '#e66465';
        if (i === 0) {
            size = 0.8;
            color = '#1105ad';
        }
        const cloudInfo = document.createElement('div');
        cloudInfo.innerHTML = `
            <div class="d-flex mt-2 justify-content-between align-items-center w-100">
                <div class="upload-cloud d-flex">
                    <span title="${cloud_label}">${cloud_label}</span>
                </div>
                <div class="d-flex right-buttons">
                    <div class="d-flex align-items-center">
                        <label for="${cloud_label}Color" class="form-label font-weight-bold">Color:</label>
                        <input type="color" class="form-control form-control-color mx-2" role="button" id="${cloud_label}Color" value="#1105ad" title="Escolhar a cor da nuvem">
                        <label for=${cloud_label}Slider" class="form-label font-weight-bold">Size:</label>
                        <input type="number" min="0" max="10" class="form-control form-control mx-2" id="${cloud_label}Slider" value="${size}" step="0.1" title="Escolhar o tamanho dos pontos da nuvem">
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-secondary mx-2" id="${cloud_label}Hide" title="Show/hide">
                            <i class="far fa-eye"></i>
                        </button>
                        <button class="btn btn-danger" id="${cloud_label}Remove" title="Remover nuvem">
                            <i class="fas fa-minus-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        div.appendChild(cloudInfo);

        convertCloudToPoints(cloud, cloud_label);

        document.getElementById(`${cloud_label}Color`).addEventListener('change', e => {
            colorHandler(e, cloud_label);
        });
        document.getElementById(`${cloud_label}Slider`).addEventListener('click', e => {
            sizeHandler(e, cloud_label);
        });
        document.getElementById(`${cloud_label}Hide`).addEventListener('click', e => {
            toggleVisibilityHandler(e, cloud_label);
        });
        document.getElementById(`${cloud_label}Remove`).addEventListener('click', e => {
            removeCloudFilter(e, cloud_label);
            cloudInfo.innerHTML = '';
        });
    });
}

function convertCloudToPoints(cloud, label) {
    const materialColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const material = new THREE.PointsMaterial({ size: 0.8, color: materialColor });
    const points = [];

    cloud.forEach(point => {
        points.push(new THREE.Vector3(point.x, point.y, point.z));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const newCloud = new THREE.Points(geometry, material);
    newCloud.name = label;
    scene.add(newCloud);

    newCloud.geometry.computeBoundingSphere();
    const inputCenter = newCloud.geometry.boundingSphere.center;
    center.x = inputCenter.x;
    center.y = inputCenter.y;
    center.z = inputCenter.z;

    controls.target.set(center.x, center.y, center.z);
    camera.position.set(center.x, center.y, center.z + 200);
    controls.update();
}

async function applyFilter(e) {
    const filterName = filterMap[this.parentNode.parentNode.parentNode.previousElementSibling.dataset.feature].name;

    const inputFile = document.getElementById(`${filterName}File`);
    if (!inputFile.files[0]) {
        alert('Selecione uma nuvem primeiro!!');
        return;
    }

    let outputFilename = document.getElementById(`${filterName}Filename`).value;
    if (outputFilename && !outputFilename.endsWith('.pcd')) {
        outputFilename += '.pcd';
    }
    const inputUrl = URL.createObjectURL(inputFile.files[0]);
    const sendBlob = await fetch(inputUrl).then(blob => blob.blob());
    const randomFilename = Math.random().toString(36).substring(7) + '.pcd';
    const sendFile = new File([sendBlob], randomFilename);

    const kdtreeMethod = getKDTreeMethod(document, filterName);
    const kdtreeValue = getKDTreeValue(document, filterName);
    const minThreshold = getMinThreshold(document, filterName);
    const maxThreshold = getMaxThreshold(document, filterName);

    const filters = [{
        filterName,
        kdtreeMethod,
        kdtreeValue,
        minThreshold,
        maxThreshold,
    }];

    const formData = new FormData();

    formData.append('filename', inputFile.files[0].name);
    formData.append('file', sendFile);
    formData.append('filters', JSON.stringify(filters));
    formData.append('outputFilename', outputFilename);
    formData.append('description', descriptionTextArea.value);
    formData.append('saveResults', saveResultsFilters.checked);

    const filterBtn = document.getElementById(`${filterName}Filter`);
    const loadingBtn = document.getElementById(`${filterName}Loading`);

    showLoading(filterBtn, loadingBtn);

    const response = await fetch('http://localhost:3000/filtering', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    hideLoading(filterBtn, loadingBtn);

    if (!response.ok) {
        alert('Algum erro aconteceu: ' + data.msg);
        return;
    }

    const cloud = scene.getObjectByName(filterName);
    scene.remove(cloud);

    const color = document.getElementById(`${filterName}Color`).value;
    const size = document.getElementById(`${filterName}Slider`).value;

    data.intermediary_clouds.forEach(cloudLog => addPointCloudFromCloudLog2(cloudLog, filterName, 0, 150, 1, size, color));
}

// pointXYZSelectButton.addEventListener('click', selectPointFromInput);

function showLoading(source, target) {
    source.style.display = 'none';
    target.classList.remove('d-none');
    target.style.display = 'block';
}

function hideLoading(source, target) {
    source.style.display = 'block';
    target.style.display = 'none';
}

// function selectPointFromInput() {
//     if (!pcdFile.cloud) {
//         alert('Selecione uma nuvem primeiro!');
//         return;
//     }

//     if  (!pointXYZInput.value) {
//         alert('Escreva um ponto válido!');
//         return;
//     }

//     let pointArray;
//     if (pointXYZInput.value.includes(',')) {
//         pointArray = pointXYZInput.value.split(',').map(p => parseFloat(p));
//     } else {
//         pointArray = pointXYZInput.value.split(' ').map(p => parseFloat(p));
//     }

//     if (pointArray.length !== 3) {
//         alert('Escreva um ponto válido!');
//         return;
//     }

//     // refactor later
//     const point = {
//         x: pointArray[0],
//         y: pointArray[1],
//         z: pointArray[2]
//     }

//     let geometry = new THREE.BufferGeometry().setFromPoints(
//         [new THREE.Vector3(point.x, point.y, point.z)]
//     );

//     let index = -1;
//     const points = pcdFile.cloud.geometry.attributes.position.array;
//     const fixed = 2;

//     for (let i = 0; i < points.length; i+=3) {
//         if (points[i].toFixed(fixed) === point.x.toFixed(fixed) && points[i+1].toFixed(fixed) === point.y.toFixed(fixed) && points[i+2].toFixed(fixed) === point.z.toFixed(fixed)) {
//             index = i;
//             break;
//         }
//     }

//     if (index === -1) {
//         alert('Esse ponto não existe!!');
//         return;
//     }

//     var material = new THREE.PointsMaterial({ size: 1.5, color: '#FFFFFF' });
//     var newCloud = new THREE.Points(geometry, material);
//     scene.add(newCloud)

//     const guiColor = gui.addColor(new ColorGUIHelper(newCloud.material, 'color'), 'value').name(`Selected point ${fileCounter}`);
//     const guiSize = gui.add(new SizeGUIHelper(newCloud.material, 'size'), 'value', 150, 400, 1).name(`Selected point ${fileCounter}`);

//     selectedNosetipCloud = {
//         cloud: newCloud,
//         point,
//         index,
//         guiColor,
//         guiSize
//     }

//     fileCounter += 1;
// }

function addPointCloudFromCloudLog2(cloudLog, label, minSize = 0, maxSize = 150, step = 1, initialPointSize = 2, color = undefined) {
    let materialColor = color;

    if (!color) {
        materialColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    const material = new THREE.PointsMaterial({ size: initialPointSize, color: materialColor });
    const points = [];

    cloudLog.cloud.forEach(point => {
        points.push(new THREE.Vector3(point.x, point.y, point.z));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const newCloud = new THREE.Points(geometry, material);
    newCloud.userData.points = points;
    newCloud.name = label;
    scene.add(newCloud);

    newCloud.geometry.computeBoundingSphere();
    const inputCenter = newCloud.geometry.boundingSphere.center;
    center.x = inputCenter.x;
    center.y = inputCenter.y;
    center.z = inputCenter.z;

    controls.target.set(center.x, center.y, center.z);
    camera.position.set(center.x, center.y, center.z + 200);
    controls.update();
}

function colorHandler(e, cloudName) {
    const cloud = scene.getObjectByName(cloudName, true);
    if (cloud) {
        cloud.material.color = new THREE.Color(e.target.value);
    }
}

function sizeHandler(e, cloudName) {
    const cloud = scene.getObjectByName(cloudName, true);
    if (cloud) {
        cloud.material.size = e.target.value;
    }
}

function toggleVisibilityHandler(e, cloudName) {
    const cloud = scene.getObjectByName(cloudName, true);
    if (!cloud) {
        return;
    }

    if (cloud.material.size === 0) {
        cloud.material.size = 0.8;
        document.getElementById(e.currentTarget.id).firstElementChild.classList.remove('fa-eye-slash');
        document.getElementById(e.currentTarget.id).firstElementChild.classList.add('fa-eye');
        return;
    }

    cloud.material.size = 0;
    document.getElementById(e.currentTarget.id).firstElementChild.classList.remove('fa-eye');
    document.getElementById(e.currentTarget.id).firstElementChild.classList.add('fa-eye-slash');
}

function removeCloudFilter(e, cloudName) {
    const cloud = scene.getObjectByName(cloudName, true);
    scene.remove(cloud);
    pcdFile = {};
}

async function applyFiltering() {
    if (!pcdFile.cloud) {
        alert('Selecione uma nuvem primeiro!!');
        return;
    }

    const filtersDivs = document.querySelectorAll('.pipeline-filter');
    const filters = [];

    if (!filtersDivs.length) {
        alert('Nenhum filtro aplicado!!');
        return;
    }

    const inputUrl = pcdFile.blobURL;
    const sendBlob = await fetch(inputUrl).then(blob => blob.blob());
    const randomFilename = Math.random().toString(36).substring(7) + '.pcd'
    const sendFile = new File([sendBlob], randomFilename);

    filtersDivs.forEach(filter => {
        const label = filter.firstElementChild.dataset.feature;
        const filterName = filterMap[label].name;
        const kdtreeMethod = getKDTreeMethod(document, filterName);
        const kdtreeValue = getKDTreeValue(document, filterName);
        const minThreshold = getMinThreshold(document, filterName);
        const maxThreshold = getMaxThreshold(document, filterName);

        // TODO: verificar campos nulos

        // filters.push({
        //     filterName,
        //     params: {
        //         kdtreeMethod,
        //         kdtreeValue,
        //         minThreshold,
        //         maxThreshold
        //     }
        // })

        filters.push({
            filterName,
            kdtreeMethod,
            kdtreeValue,
            minThreshold,
            maxThreshold
        })
    });

    const formData = new FormData();

    formData.append('filename', pcdFile.filename);
    formData.append('file', sendFile);
    formData.append('filters', JSON.stringify(filters));
    formData.append('description', descriptionTextArea.value);
    formData.append('saveResults', saveResultsFilters.checked);

    const filterBtn = document.getElementById('performFiltering');
    const loadingBtn = document.getElementById('performFilteringLoading');

    showLoading(filterBtn, loadingBtn);

    const response = await fetch('http://localhost:3000/filtering', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    hideLoading(filterBtn, loadingBtn);

    if (!response.ok) {
        alert('Algum erro aconteceu: ' + data.msg);
        return;
    }

    cleanCloudLogEntries();

    data.intermediary_clouds.forEach(cloudLog => addPointCloudFromCloudLog(cloudLog));
}

function setChangeEvents(filterName) {
    document.getElementById(`${filterName}File`).addEventListener('change', e => {
        const url = URL.createObjectURL(e.target.files[0]);
        const color = document.getElementById(`${filterName}ColorInput`).value;
        const size = document.getElementById(`${filterName}SliderInput`).value;
        const cloud = scene.getObjectByName(`${filterName}File`);
        scene.remove(cloud);
        addPCDFile1(url, filterName + 'File', color, size);
    });
    document.getElementById(`${filterName}Filename`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}KDTreeMethodRadius`).addEventListener('change', e => {
        e.target.setAttribute('checked', true);
        document.getElementById(`${filterName}KDTreeMethodK`).setAttribute('checked', false);
    });
    document.getElementById(`${filterName}KDTreeMethodK`).addEventListener('change', e => {
        e.target.setAttribute('checked', true);
        document.getElementById(`${filterName}KDTreeMethodRadius`).setAttribute('checked', false);
    });
    document.getElementById(`${filterName}KDTreeValue`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}MinThreshold`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}MaxThreshold`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}Color`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}Slider`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}ColorInput`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
    document.getElementById(`${filterName}SliderInput`).addEventListener('change', e => {
        e.target.setAttribute('value', e.target.value);
    });
}

function getKDTreeMethod(document, filterName) {
    return document.getElementById(`${filterName}KDTreeMethodRadius`).checked ? 'radius' : 'k';
}

function getKDTreeValue(document, filterName) {
    return document.getElementById(`${filterName}KDTreeValue`).value;
}

function getMinThreshold(document, filterName) {
    return document.getElementById(`${filterName}MinThreshold`).value;
}

function getMaxThreshold(document, filterName) {
    return document.getElementById(`${filterName}MaxThreshold`).value;
}

function addFilter(label, name, min, max, checked = true) {
    currentFilters.push(label);
    const pipelineFilterChild = createFilterDiv(label, name, min, max, checked);
    dragAndDropHandlers(pipelineFilterChild);
    pipelineFilterChild.firstElementChild.addEventListener('click', collapse);
    pipelineFilterChild.firstElementChild.lastElementChild.addEventListener('click', removeFilter);
    pipelineContainer.appendChild(pipelineFilterChild);
    setChangeEvents(name);
    setFilterCardEvents(name);
}

document.getElementById('clearPointAnalysis').addEventListener('click', e => {
    document.getElementById('pointAnalysisResult').innerHTML = '';
    e.target.style.display = 'none';
    cleanSelectedNosetipCloud();
    cleanNeighborhoodCloud();
});

function setFilterCardEvents(filterName) {
    document.getElementById(`${filterName}Filter`).addEventListener('click', applyFilter);
    document.getElementById(`${filterName}Color`).addEventListener('change', e => {
        colorHandler(e, `${filterName}`);
    });
    document.getElementById(`${filterName}Slider`).addEventListener('change', e => {
        sizeHandler(e, `${filterName}`);
    });
    document.getElementById(`${filterName}ColorInput`).addEventListener('change', e => {
        colorHandler(e, `${filterName}File`);
    });
    document.getElementById(`${filterName}SliderInput`).addEventListener('change', e => {
        sizeHandler(e, `${filterName}File`);
    });
    document.getElementById(`${filterName}Remove`).addEventListener('click', e => {
        removeCloudFilter(e, `${filterName}`);
    });
    document.getElementById(`${filterName}Hide`).addEventListener('click', e => {
        toggleVisibilityHandler(e, `${filterName}`);
    });
    document.getElementById(`${filterName}RemoveInput`).addEventListener('click', e => {
        removeCloudFilter(e, `${filterName}File`);
    });
    document.getElementById(`${filterName}HideInput`).addEventListener('click', e => {
        toggleVisibilityHandler(e, `${filterName}File`);
    });
}

function collapse() {
    this.classList.toggle('active');

    const content = this.nextElementSibling;

    if (content.style.display === 'flex') {
        content.style.display = 'none';
    } else {
        content.style.display = 'flex';
    }
}

function removeFilter(e) {
    e.stopPropagation();
    document.getElementById(`${filterMap[this.parentNode.dataset.feature].name}RemoveInput`).click();
    currentFilters.splice(currentFilters.indexOf(this.previousElementSibling.innerHTML), 1);
    document.querySelector(`div[data-feature="${this.parentNode.dataset.feature}"]`).parentNode.remove();
    const cloud = scene.getObjectByName(filterMap[this.parentNode.dataset.feature].name, true);
    scene.remove(cloud);
}

function handleDragStart(e) {
    this.style.opacity = '0.4';

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.style.opacity = '1';

    items.forEach(function (item) {
        item.classList.remove('over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    e.stopPropagation();

    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');

        // button to remove filters
        this.firstElementChild.lastElementChild.addEventListener('click', removeFilter);
        dragSrcEl.firstElementChild.lastElementChild.addEventListener('click', removeFilter);

        // attach collapse event
        this.firstElementChild.addEventListener('click', collapse);
        dragSrcEl.firstElementChild.addEventListener('click', collapse);

        const thisFilterName = this.firstElementChild.dataset.feature;
        const dragSrcElFilterName = dragSrcEl.firstElementChild.dataset.feature;

        setChangeEvents(filterMap[thisFilterName].name);
        setChangeEvents(filterMap[dragSrcElFilterName].name);
        setFilterCardEvents(filterMap[thisFilterName].name);
        setFilterCardEvents(filterMap[dragSrcElFilterName].name);
    }

    return false;
}

function dragAndDropHandlers(item) {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
}

// Event Lisntener Functions

function addPCDFile1(inputUrl, name, color, size) {
    loader.load(inputUrl, pointCloud => {
        pointCloud.material.size = size;
        pointCloud.material.color = new THREE.Color(color);
        pointCloud.name = name;
        scene.add(pointCloud);

        const inputCenter = pointCloud.geometry.boundingSphere.center;
        center.x = inputCenter.x;
        center.y = inputCenter.y;
        center.z = inputCenter.z;

        controls.target.set(center.x - 30, center.y, center.z);
        camera.position.set(center.x, center.y, center.z + 220);
        controls.update();
    });
}

function uploadPCDFile(blobURL, filename, cloudName, color, size) {
    loader.load(blobURL, pointCloud => {
        pointCloud.name = cloudName;
        pointCloud.material.color = new THREE.Color(color);
        pointCloud.material.size = size;
        scene.add(pointCloud);

        const inputCenter = pointCloud.geometry.boundingSphere.center;
        center.x = inputCenter.x;
        center.y = inputCenter.y;
        center.z = inputCenter.z;

        controls.target.set(center.x - 30, center.y, center.z);
        camera.position.set(center.x, center.y, center.z + 220);
        controls.update();

        pcdFile = {
            cloud: pointCloud,
            blobURL,
            filename,
        };
    });
}

async function findFiducialPoint() {
    if (!pcdFile.cloud) {
        alert('Selecione uma nuvem primeiro!!');
        return;
    }

    cleanCloudLogEntries();
    cleanPointAnalysis();

    const inputUrl = pcdFile.blobURL;
    const sendBlob = await fetch(inputUrl).then(blob => blob.blob());
    const randomFilename = Math.random().toString(36).substring(7) + '.pcd'
    const sendFile = new File([sendBlob], randomFilename);

    const flexibilizeThresholds = document.getElementById('flexibilizeThresholds');
    const flexibilizeCrop = document.getElementById('flexibilizeCrop');
    const computationRadiusOrKSize = document.getElementById('computationRadiusOrKSize');
    const computationMethod = document.getElementById('radiusMethod').checked ? 'radius' : 'k';
    const minGaussianCurvature = document.getElementById('minGaussianCurvature');
    const shapeIndexLimit = document.getElementById('shapeIndexLimit');
    const minCropSize = document.getElementById('minCropSize');
    const maxCropSize = document.getElementById('maxCropSize');
    const minPointsToContinue = document.getElementById('minPointsToContinue');
    const removeIsolatedPointsRadius = document.getElementById('removeIsolatedPointsRadius');
    const removeIsolatedPointsThreshold = document.getElementById('removeIsolatedPointsThreshold');
    const nosetipSearchRadius = document.getElementById('nosetipSearchRadius');

    const formData = new FormData();

    formData.append('flexibilizeThresholds', flexibilizeThresholds.checked);
    formData.append('flexibilizeCrop', flexibilizeCrop.checked);
    formData.append('computationRadiusOrKSize', computationRadiusOrKSize.value);
    formData.append('computationMethod', computationMethod);
    formData.append('minGaussianCurvature', minGaussianCurvature.value);
    formData.append('shapeIndexLimit', shapeIndexLimit.value);
    formData.append('minCropSize', minCropSize.value);
    formData.append('maxCropSize', maxCropSize.value);
    formData.append('minPointsToContinue', minPointsToContinue.value);
    formData.append('removeIsolatedPointsRadius', removeIsolatedPointsRadius.value);
    formData.append('removeIsolatedPointsThreshold', removeIsolatedPointsThreshold.value);
    formData.append('nosetipSearchRadius', nosetipSearchRadius.value);
    formData.append('fiducialPoint', 'nosetip');
    formData.append('file', sendFile);

    showLoading(btn.findFiducialPointButton, btn.findFiducialPointButtonLoading);

    const response = await fetch('http://localhost:3000/find-fiducial-point', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    hideLoading(btn.findFiducialPointButton, btn.findFiducialPointButtonLoading);

    if (!response.ok) {
        alert('Algum erro ocorreu: ' + data.msg);
        return;
    }

    data.intermediary_clouds.forEach(cloudLog => addPointCloudFromCloudLog(cloudLog));

    const fiducialPointCloudLog = {
        cloud_label: 'Ponto fiducial',
        cloud: [{ x: data.point.x, y: data.point.y, z: data.point.z }]
    };

    addPointCloudFromCloudLog(fiducialPointCloudLog, 150, 400, 1, 4, '#FFFFFF');
}

async function getPointAnalysis() {
    if (!selectedNosetipCloud || (Object.keys(selectedNosetipCloud).length === 0 && selectedNosetipCloud.constructor === Object)) {
        alert('Selecione um ponto antes de realizar sua análise');
        return;
    }

    const inputUrl = pcdFile.blobURL;
    const sendBlob = await fetch(inputUrl).then(blob => blob.blob());
    const randomFilename = Math.random().toString(36).substring(7) + '.pcd'
    const sendFile = new File([sendBlob], randomFilename);

    const method = document.getElementById('pointAnalysisRadiusMethod').checked ? 'radius' : 'k';
    const pointAnalysisComputationRadiusOrKSize = document.getElementById('pointAnalysisComputationRadiusOrKSize');

    const formData = new FormData();

    formData.append('file', sendFile);
    formData.append('computationMethod', method);
    formData.append('computationSize', pointAnalysisComputationRadiusOrKSize.value);
    formData.append('pointIndexToAnalyze', selectedNosetipCloud.index);

    const response = await fetch('http://localhost:3000/point-analysis', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    if (!response.ok) {
        alert('Algum erro ocorreu: ' + data.msg);

        return;
    }

    insertPointAnalysisOnHTML(data.point_analysis);

    const cloudLog = {
        cloud_label: 'Vizinhança',
        cloud: data.point_analysis.neighborhood
    };

    addPointCloudFromCloudLog(cloudLog);
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

document.onkeydown = e => {
    e = e || window.event;

    if (e.keyCode === 27) {
        multiplePointsRaycaster();
    }
};

function multiplePointsRaycaster() {
    if (!pcdFile.cloud) return;

    if (multipleRunningRaycaster) {
        scene.remove(sphere);
        canvas.removeEventListener('click', runMultiplePointsRaycast);
    } else {
        scene.add(sphere);
        canvas.addEventListener('click', runMultiplePointsRaycast);
    }

    multipleRunningRaycaster = !multipleRunningRaycaster;
}

function toggleRaycaster() {
    if (!pcdFile.cloud) return;

    if (runningRaycaster) {
        scene.remove(sphere);
        canvas.removeEventListener('click', runRaycast);
    } else {
        scene.add(sphere);
        canvas.addEventListener('click', runRaycast);
    }

    runningRaycaster = !runningRaycaster;
}

function runMultiplePointsRaycast() {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(pcdFile.cloud);

    if (intersects.length) {
        const newColor = new THREE.Color();
        newColor.setRGB(1, 1, 1);

        const index = intersects[0].index;
        const material = new THREE.PointsMaterial({ size: 2, color: '#FFFFFF' });
        const point = {
            x: pcdFile.cloud.geometry.getAttribute('position').getX(index),
            y: pcdFile.cloud.geometry.getAttribute('position').getY(index),
            z: pcdFile.cloud.geometry.getAttribute('position').getZ(index)
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(point.x, point.y, point.z)]
        );
        const newCloud = new THREE.Points(geometry, material);
        scene.add(newCloud);

        multiplesPoints.push({
            cloud: newCloud,
            point,
            index
        });
    }
}

function runRaycast() {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(pcdFile.cloud);

    if (intersects.length) {
        cleanSelectedNosetipCloud();
        cleanPointAnalysis();

        const newColor = new THREE.Color();
        newColor.setRGB(1, 1, 1);

        const index = intersects[0].index;

        toggleRaycaster();

        const material = new THREE.PointsMaterial({ size: 2, color: '#FFFFFF' });

        const point = {
            x: pcdFile.cloud.geometry.getAttribute('position').getX(index),
            y: pcdFile.cloud.geometry.getAttribute('position').getY(index),
            z: pcdFile.cloud.geometry.getAttribute('position').getZ(index)
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(point.x, point.y, point.z)]
        );

        const newCloud = new THREE.Points(geometry, material);
        scene.add(newCloud);

        const guiColor = gui.addColor(new ColorGUIHelper(newCloud.material, 'color'), 'value').name(`Selected point ${fileCounter}`);
        const guiSize = gui.add(new SizeGUIHelper(newCloud.material, 'size'), 'value', 150, 400, 1).name(`Selected point ${fileCounter}`);

        selectedNosetipCloud = {
            cloud: newCloud,
            point,
            index,
            guiColor,
            guiSize
        }

        fileCounter += 1;
    }
}

function toggleFocusRaycaster(e) {
    if (runningFocusRaycaster) {
        canvas.removeEventListener('click', focusOnNewPoint);
    } else {
        canvas.addEventListener('click', focusOnNewPoint);
    }

    runningFocusRaycaster = !runningFocusRaycaster;
}

function insertPointAnalysisOnHTML(pointAnalysis) {
    document.getElementById('pointAnalysisResult').innerHTML = `
        <li class="list-group-item"><span class="font-weight-bold">Ponto (x, y, z):</span> (${selectedNosetipCloud.point.x.toFixed(5)}, ${selectedNosetipCloud.point.y.toFixed(5)}, ${selectedNosetipCloud.point.z.toFixed(5)})</li>
        <li class="list-group-item"><span class="font-weight-bold">Número de pontos:</span> ${pointAnalysis.neighborhood.length}</li>
        <li class="list-group-item"><span class="font-weight-bold">Curvatura Gaussiana:</span> ${pointAnalysis.gaussian_curvature.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Shape Index:</span> ${pointAnalysis.shape_index.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Normal (x, y, z):</span> (${pointAnalysis.normal.x.toFixed(5)}, ${pointAnalysis.normal.y.toFixed(5)}, ${pointAnalysis.normal.z.toFixed(5)})</li>
        <li class="list-group-item"><span class="font-weight-bold">PCs (k1, k2):</span> (${pointAnalysis.principal_curvatures.k1.toFixed(5)}, ${pointAnalysis.principal_curvatures.k2.toFixed(5)})</li>
        <li class="list-group-item"><span class="font-weight-bold">Curvatura Média:</span> ${pointAnalysis.mean_curvature.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Curvatura (Curvedness):</span> ${pointAnalysis.curvedness.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Razão das Curvaturas Principais:</span> ${pointAnalysis.principal_curvature_ratio.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Soma:</span> ${pointAnalysis.geometric_features.sum.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Omnivariância:</span> ${pointAnalysis.geometric_features.omnivariance.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Autoentropia:</span> ${pointAnalysis.geometric_features.eigenentropy.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Anisotropia:</span> ${pointAnalysis.geometric_features.anisotropy.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Planaridade:</span> ${pointAnalysis.geometric_features.planarity.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Linearidade:</span> ${pointAnalysis.geometric_features.linearity.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Variação de superfície:</span> ${pointAnalysis.geometric_features.surfaceVariation.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Esfericidade:</span> ${pointAnalysis.geometric_features.sphericity.toFixed(5)}</li>
        <li class="list-group-item"><span class="font-weight-bold">Verticalidade:</span> ${pointAnalysis.geometric_features.verticality.toFixed(5)}</li>
    `;
    document.getElementById('clearPointAnalysis').style.display = 'inline-block';
}

function addPointCloudFromCloudLog(cloudLog, minSize = 0, maxSize = 150, step = 1, initialPointSize = 2, color = undefined) {
    let materialColor = color;

    if (!color) {
        materialColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    const material = new THREE.PointsMaterial({ size: initialPointSize, color: materialColor });
    const points = [];

    cloudLog.cloud.forEach(point => {
        points.push(new THREE.Vector3(point.x, point.y, point.z));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const newCloud = new THREE.Points(geometry, material);
    newCloud.userData.points = points;
    newCloud.name = 'neighborhood';
    scene.add(newCloud);

    if (!pcdFile || (Object.keys(pcdFile).length === 0 && pcdFile.constructor === Object)) {
        newCloud.geometry.computeBoundingSphere();
        const inputCenter = newCloud.geometry.boundingSphere.center;
        center.x = inputCenter.x;
        center.y = inputCenter.y;
        center.z = inputCenter.z;

        controls.target.set(center.x, center.y, center.z);
        controls.update();
    }

    const guiColor = gui.addColor(new ColorGUIHelper(newCloud.material, 'color'), 'value').name(cloudLog.cloud_label);
    const guiSize = gui.add(new SizeGUIHelper(newCloud.material, 'size'), 'value', minSize, maxSize, step).name(cloudLog.cloud_label);

    cloudLogFiles.push({
        cloud: newCloud,
        guiColor,
        guiSize,
    });

    neighborhoodCloud = {
        cloud: newCloud,
        guiColor,
        guiSize
    };

    fileCounter += 1;
}

function downloadMultiplePoints() {
    if (!multiplesPoints.length) {
        return;
    }

    const points = multiplesPoints.map(point => point.point);
    const n = points.length;

    let baseFile = `# .PCD v0.7 - Point Cloud Data file format\nVERSION 0.7\nFIELDS x y z\nSIZE 4 4 4\nTYPE F F F\nCOUNT 1 1 1\nWIDTH 1\nHEIGHT ${n}\nVIEWPOINT 0 0 0 1 0 0 0\nPOINTS ${n}\nDATA ascii\n`;

    for (let i = 0; i < points.length; i++) {
        baseFile += `${points[i].x} ${points[i].y} ${points[i].z}\n`
    }

    saveData(baseFile, `points_${pcdFile.filename}`);
    multiplePointsRaycaster();
    multiplesPoints.forEach(point => scene.remove(point.cloud));
    multiplesPoints = [];
}

function download() {
    if (!selectedNosetipCloud.point) {
        return;
    }

    const cloud = scene.getObjectByName('neighborhood', true);

    let baseFile = '# .PCD v0.7 - Point Cloud Data file format\nVERSION 0.7\nFIELDS x y z\nSIZE 4 4 4\nTYPE F F F\nCOUNT 1 1 1\nWIDTH 1\nHEIGHT 1\nVIEWPOINT 0 0 0 1 0 0 0\nPOINTS 1\nDATA ascii\n';
    baseFile = baseFile + `${selectedNosetipCloud.point.x} ${selectedNosetipCloud.point.y} ${selectedNosetipCloud.point.z}\n`;

    const points = cloud.userData.points;
    for (let i = 0; i < points.length; i++) {
        baseFile += `${points[i].x} ${points[i].y} ${points[i].z}\n`
    }

    saveData(baseFile, `neighborhood_${pcdFile.filename}`);
}

const saveData = (function () {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    return (data, fileName) => {
        const blob = new Blob([data], { type: 'octet/stream' });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function cleanPointAnalysis() {
    document.getElementById('pointAnalysisResult').innerHTML = '';
}

function cleanSelectedNosetipCloud() {
    if ('cloud' in selectedNosetipCloud && selectedNosetipCloud.cloud) {
        scene.remove(selectedNosetipCloud.cloud);
        delete selectedNosetipCloud.cloud;
    }

    if ('guiColor' in selectedNosetipCloud && selectedNosetipCloud.guiColor) {
        gui.remove(selectedNosetipCloud.guiColor);
        delete selectedNosetipCloud.guiColor;
    }

    if ('guiSize' in selectedNosetipCloud && selectedNosetipCloud.guiSize) {
        gui.remove(selectedNosetipCloud.guiSize);
        delete selectedNosetipCloud.guiSize;
    }

    selectedNosetipCloud = {};
    cleanPointAnalysis();
}

function cleanNeighborhoodCloud(cloud) {
    if ('cloud' in neighborhoodCloud && neighborhoodCloud.cloud) {
        scene.remove(neighborhoodCloud.cloud);
        delete neighborhoodCloud.cloud;
    }

    if ('guiColor' in neighborhoodCloud && neighborhoodCloud.guiColor) {
        gui.remove(neighborhoodCloud.guiColor);
        delete neighborhoodCloud.guiColor;
    }

    if ('guiSize' in neighborhoodCloud && neighborhoodCloud.guiSize) {
        gui.remove(neighborhoodCloud.guiSize);
        delete neighborhoodCloud.guiSize;
    }

    neighborhoodCloud = {};
}

function cleanCloudLogEntries() {
    for (let i = 0; i < cloudLogFiles.length; i++) {
        const c = cloudLogFiles[i];

        scene.remove(c.cloud);
        gui.remove(c.guiColor);
        gui.remove(c.guiSize);
    }

    cloudLogFiles = [];
}

function cleanPCDFile() {
    if ('cloud' in pcdFile && pcdFile.cloud) {
        scene.remove(pcdFile.cloud);
    }

    if ('guiColor' in pcdFile && pcdFile.guiColor) {
        gui.remove(pcdFile.guiColor);
    }

    if ('guiSize' in pcdFile && pcdFile.guiSize) {
        gui.remove(pcdFile.guiSize);
    }

    pcdFile = {};
}

function removeAllSceneChildren() {
    while(scene.children.length > 0){
        scene.remove(scene.children[0]);
    }
}

function cleanScene() {
    pcdFile = {};
    // cleanPCDFile();
    // cleanSelectedNosetipCloud();
    // cleanCloudLogEntries();
    // multiplesPoints.forEach(point => scene.remove(point.cloud));
    // removeAllSceneChildren();
    removeAllSceneChildren();
    cleanCloudLogEntries();
    [...document.getElementsByClassName('upload-cloud-button')].forEach(btn => {
        if (btn.disabled) btn.disabled = false;
    });
    const uploadDivs = [...document.getElementsByClassName('load-image-block')];
    for (let i = 0; i < uploadDivs.length-1; i++) {
        uploadDivs[i].remove();
    }
    document.getElementsByClassName('joined-clouds')[0].innerHTML = '';
}

function focusOnNewPoint(e) {
    mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    focusRaycaster.setFromCamera(mouse, camera);

    const intersects = focusRaycaster.intersectObject(pcdFile.cloud);

    if (intersects.length) {
        const index = intersects[0].index;

        const point = {
            x: pcdFile.cloud.geometry.getAttribute('position').getX(index),
            y: pcdFile.cloud.geometry.getAttribute('position').getY(index),
            z: pcdFile.cloud.geometry.getAttribute('position').getZ(index)
        }

        controls.target.set( point.x, point.y, point.z );
        camera.position.set( point.x, point.y, point.z + 50 );
        controls.update();

        toggleFocusRaycaster();
    }
}

function loadAvaliableClouds() {
    fetch('http://localhost:3000/avaliable-clouds', { method: 'GET' }).then((response) => {
        response.json().then(res => {
            setAvaliableFoldersHTML(res);
            $('#pills-tab a').on('click', function (e) {
                e.preventDefault()
                $(this).tab('show')
              })
        })
    });
}

function setAvaliableFoldersHTML(folders) {
    let avaliableCloudsCounter = 0;

    const ul = document.getElementById('pills-tab');
    const tabContent = document.getElementById('pills-tabContent');

    let isFirst = true;

    for (let folder in folders) {
        const li = document.createElement('li');
        li.classList.add('nav-item');
        li.setAttribute('role', 'presentation');
        const btnClass = isFirst ? 'nav-link active' : 'nav-link';
        li.innerHTML = `
            <a
                class="${btnClass}"
                id="pills-${folder}-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-${folder}"
                href="#pills-${folder}"
                type="button"
                role="tab"
                aria-controls="pills-${folder}"
                aria-selected="${isFirst ? 'true' : 'false'}"
            >
                ${folder}
            </a>
        `;
        ul.appendChild(li);

        const tabContentChild = document.createElement('div');
        tabContentChild.classList.add('tab-pane', 'fade');
        if (isFirst) {
            tabContentChild.classList.add('show', 'active');
            isFirst = false;
        }
        tabContentChild.id = `pills-${folder}`;
        tabContentChild.setAttribute('role', 'tabpanel');
        tabContentChild.setAttribute('aria-labelledby', `pills-${folder}-tab`);

        folders[folder].forEach(cloud => {
            const mainDiv = document.createElement('div');
            mainDiv.classList.add('d-flex');

            const headDiv = document.createElement('div');
            headDiv.classList.add('upload-cloud', 'd-flex', 'align-items-center');

            const headDivBtn = document.createElement('button');
            headDivBtn.classList.add('bg-transparent', 'upload-cloud-button');
            headDivBtn.id = `pcdFile${avaliableCloudsCounter}`;
            headDivBtn.innerHTML = '<i class="fas fa-upload"></i>';

            const headDivSpan = document.createElement('span');
            headDivSpan.id = `pcdFile${avaliableCloudsCounter}Filename`;
            headDivSpan.title = cloud;
            headDivSpan.innerHTML = cloud;

            headDiv.appendChild(headDivBtn);
            headDiv.appendChild(headDivSpan);

            mainDiv.appendChild(headDiv);

            const tailDiv = document.createElement('div');
            tailDiv.classList.add('d-flex', 'right-buttons', 'mt-2', 'justify-content-end', 'align-items-center');

            const tailDivFirst = document.createElement('div');
            tailDivFirst.classList.add('d-flex', 'align-items-center');

            const labelColor = document.createElement('label');
            labelColor.setAttribute('for', `pcdFile${avaliableCloudsCounter}Color`);
            labelColor.classList.add('form-label', 'font-weight-bold');
            labelColor.innerHTML = 'Color:';
            const inputColor = document.createElement('input');
            inputColor.setAttribute('type', 'color');
            inputColor.setAttribute('role', 'button')
            inputColor.setAttribute('min', 0);
            inputColor.setAttribute('max', 10);
            inputColor.classList.add('form-control', 'mx-2');
            inputColor.id = `pcdFile${avaliableCloudsCounter}Color`;
            inputColor.title = '"Escolha a cor da nuvem';
            inputColor.value = '#1105ad';

            const labelSize = document.createElement('label');
            labelSize.setAttribute('for', `pcdFile${avaliableCloudsCounter}Slider`);
            labelSize.classList.add('form-label', 'font-weight-bold');
            labelSize.innerHTML = 'Size:';
            const inputSize = document.createElement('input');
            inputSize.setAttribute('type', 'number');
            inputSize.setAttribute('min', 0);
            inputSize.setAttribute('max', 10);
            inputSize.classList.add('form-control', 'form-control-color', 'mx-2');
            inputSize.id = `pcdFile${avaliableCloudsCounter}Slider`;
            inputSize.title = 'Escolha o tamanho dos pontos da nuvem';
            inputSize.value = '0.8';
            inputSize.step = '0.1';

            tailDivFirst.appendChild(labelColor);
            tailDivFirst.appendChild(inputColor);
            tailDivFirst.appendChild(labelSize);
            tailDivFirst.appendChild(inputSize);

            const tailDivSecond = document.createElement('div');
            tailDivSecond.classList.add('d-flex', 'align-items-center');

            const tailDivSecondHide = document.createElement('button');
            tailDivSecondHide.classList.add('btn', 'btn-secondary', 'mx-2');
            tailDivSecondHide.id = `pcdFile${avaliableCloudsCounter}Hide`;
            tailDivSecondHide.setAttribute('title', 'Show/hide');
            tailDivSecondHide.innerHTML = '<i class="far fa-eye"></i>';

            const tailDivSecondRemove = document.createElement('button');
            tailDivSecondRemove.classList.add('btn', 'btn-danger');
            tailDivSecondRemove.id = `pcdFile${avaliableCloudsCounter}Remove`;
            tailDivSecondRemove.setAttribute('title', 'Remover nuvem');
            tailDivSecondRemove.innerHTML = '<i class="fas fa-minus-circle"></i>';

            tailDivSecond.appendChild(tailDivSecondHide);
            tailDivSecond.appendChild(tailDivSecondRemove);

            tailDiv.appendChild(tailDivFirst);
            tailDiv.appendChild(tailDivSecond);

            mainDiv.appendChild(tailDiv);
            tabContentChild.appendChild(mainDiv);

            const cloudName = `file-a-${avaliableCloudsCounter}`;
            headDivBtn.addEventListener('click', e => {
                e.stopPropagation();
                fetch(`http://localhost:3000/avaliable-clouds/${folder}/${cloud}`, { method: 'GET' })
                    .then(response => {
                        response.blob().then(res => {
                            const pcdBlob = URL.createObjectURL(res);
                            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
                            const randomSize = Math.round(10 * (Math.random() * (1.6 - 0.8) + 0.8)) / 10;
                            uploadPCDFile(pcdBlob, cloud, cloudName, randomColor, randomSize);
                            headDivBtn.disabled = true;
                        });
                    });
            });
            inputColor.addEventListener('change', e => {
                colorHandler(e, cloudName);
            });
            inputSize.addEventListener('change', e => {
                sizeHandler(e, cloudName);
            });
            tailDivSecondHide.addEventListener('click', e => {
                toggleVisibilityHandler(e, cloudName);
            });
            tailDivSecondRemove.addEventListener('click', e => {
                removeCloudFilter(e, cloudName);
                headDivBtn.disabled = false;
            });
            avaliableCloudsCounter += 1;
        });
        tabContent.appendChild(tabContentChild);
    }
}

// function setAvaliableFoldersHTML(folders) {
//     const avaliableFoldersContainer = document.getElementById('avaliableFoldersContainer');
//     avaliableFoldersContainer.innerHTML = '';
//     let first = true;

//     for (let folder in folders) {
//         const folderContainer = document.createElement('div');

//         folderContainer.classList.add('avaliable-folder', 'badge' ,'badge-secondary');
//         folderContainer.id = 'folder-' + folder;
//         folderContainer.innerText = folder;

//         folderContainer.addEventListener('click', () => {
//             document.getElementById('')
//         });
//         setAvaliableCloudsHTML(folder, folders[folder], first);
//         first = false;

//         avaliableFoldersContainer.appendChild(folderContainer);
//     }

//     document.getElementById(`folder-${Object.keys(folders)[0]}`).click();
// }


// function setAvaliableCloudsHTML(folder, clouds, isFirst) {
//     const avaliableCloudsContainer = document.getElementById('avaliableCloudsContainer');
//     avaliableCloudsContainer.innerHTML = '';

//     for (let cloud of clouds) {
//         const child = document.createElement('div');
//         child.classList.add('load-image-block', 'w-100', 'd-flex', 'align-items-center');
//         child.id = folder;
//         if (!isFirst) {
//             child.classList.add('hide');
//         }
//         child.innerHTML = `
//             <div class="upload-cloud w-40 d-flex align-items-center">
//                 <button id="pcdFile${avaliableCloudsCounter}" name="pcdFile${avaliableCloudsCounter}">
//                     <i class="fas fa-upload"></i>
//                 </button>
//                 <span class="upload-cloud-e" id="pcdFile${avaliableCloudsCounter}Filename" title="${cloud}">${cloud}</span>
//             </div>
//             <div class="d-flex mt-2 justify-content-end align-items-center w-100">
//                 <div class="d-flex align-items-center">
//                     <label for="pcdFile${avaliableCloudsCounter}Color" class="form-label">Color:</label>
//                     <input type="color" class="form-control form-control-color mx-2" role="button" id="pcdFile${avaliableCloudsCounter}Color" value="#1105ad" title="Escolhar a cor da nuvem">
//                     <label for="pcdFile${avaliableCloudsCounter}Slider" class="form-label">Size:</label>
//                     <input type="number" min="0" max="10" class="form-control form-control mx-2" id="pcdFile${avaliableCloudsCounter}Slider" value="0.8" step="0.1" min="0" title="Escolhar o tamanho dos pontos da nuvem">
//                 </div>
//                 <div class="d-flex align-items-center">
//                     <button class="btn btn-secondary mx-2" id="pcdFile${avaliableCloudsCounter}Hide" title="Show/hide">
//                         <i class="far fa-eye"></i>
//                     </button>
//                     <button class="btn btn-danger" id="pcdFile${avaliableCloudsCounter}Remove" title="Remover nuvem">
//                         <i class="fas fa-minus-circle"></i>
//                     </button>
//                 </div>
//             </div>
//         `;
//         avaliableCloudsContainer.appendChild(child);
//         const cloudName = `file-a-${avaliableCloudsCounter}`;

//         const loadButton = document.getElementById(`pcdFile${avaliableCloudsCounter}`);

//         loadButton.addEventListener('click', e => {
//             e.stopPropagation();
//             fetch(`http://localhost:3000/avaliable-clouds/${folder}/${cloud}`, { method: 'GET' })
//                 .then(response => {
//                     response.blob().then(res => {
//                         const pcdBlob = URL.createObjectURL(res);
//                         const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
//                         const randomSize = Math.round(10 * (Math.random() * (1.6 - 0.8) + 0.8)) / 10;
//                         uploadPCDFile(pcdBlob, cloud, cloudName, randomColor, randomSize);
//                         loadButton.disabled = true;
//                     });
//                 });
//         });
//         document.getElementById(`pcdFile${avaliableCloudsCounter}Color`).addEventListener('change', e => {
//             colorHandler(e, cloudName);
//         });
//         document.getElementById(`pcdFile${avaliableCloudsCounter}Slider`).addEventListener('change', e => {
//             sizeHandler(e, cloudName);
//         });
//         document.getElementById(`pcdFile${avaliableCloudsCounter}Hide`).addEventListener('click', e => {
//             toggleVisibilityHandler(e, cloudName);
//         });
//         document.getElementById(`pcdFile${avaliableCloudsCounter}Remove`).addEventListener('click', e => {
//             removeCloudFilter(e, cloudName);
//             loadButton.disabled = false;
//         });
//         avaliableCloudsCounter += 1;
//     }

//     // folderContainer.removeEventListener('click', setAvaliableCloudsHTML);
// }

// jquery helpers
$(document).on('change', '.custom-file-input', function (event) {
    $(this).next('.custom-file-label').html(event.target.files[0].name);
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip({
        'trigger': 'hover'
    });
});

$(document).ready(function() {
    const element = document.getElementById('resizable');

    if (element) {
        const resizer = document.createElement('div');
        resizer.className = 'draghandle';
        resizer.style.width = '6px';
        resizer.style.height = '100vh';
        element.appendChild(resizer);
        resizer.addEventListener('mousedown', initResize, false);
    }

    function initResize(e) {
        window.addEventListener('mousemove', Resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function Resize(e) {
        element.style.width = (e.clientX - element.offsetLeft) + 'px';
    }

    function stopResize(e) {
        window.removeEventListener('mousemove', Resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
});

init();
animate();