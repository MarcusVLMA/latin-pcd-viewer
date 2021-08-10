const findFiducialPointButton = document.getElementById('findFiducialPointButton');
const selectPointButton = document.getElementById('selectPointButton');
const analysisPointButton = document.getElementById('analysisPointButton');
const analysisPointButtonLoading = document.getElementById('analysisPointButtonLoading');
const downloadButton = document.getElementById('downloadButton');
const clearSceneButton = document.getElementById('clearScene');
const findFiducialPointButtonLoading = document.getElementById('findFiducialPointButtonLoading');
const mergeButton = document.getElementById('merge');
const mergeButtonLoading = document.getElementById('mergeLoading');
const selectLandmarkButtons = [...document.getElementsByClassName('select-landmark-button')];

export {
    findFiducialPointButton,
    selectPointButton,
    analysisPointButton,
    analysisPointButtonLoading,
    downloadButton,
    clearSceneButton,
    findFiducialPointButtonLoading,
    mergeButton,
    mergeButtonLoading,
    selectLandmarkButtons
};
