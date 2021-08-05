import { getRandomColorAndSize } from './utils.js';

export function createFilterDiv(label, name, min, max, checked) {
    const pipelineFilterChild = document.createElement('div');

    pipelineFilterChild.classList.add('pipeline-filter');
    pipelineFilterChild.setAttribute('draggable', true);
    pipelineFilterChild.setAttribute('id', 'draggable');

    let radiusChecked = '';
    let kChecked = '';

    if (checked) {
        radiusChecked = 'checked';
    } else {
        kChecked = 'checked';
    }

    const [c1] = getRandomColorAndSize();
    const [c2] = getRandomColorAndSize();

    pipelineFilterChild.innerHTML = `
        <div class="custom-collapsible active" data-feature="${label}">
            <h2>${label}</h2>
            <div class="circle">
            <button class="remove-filter">
                <i class="fas fa-trash trash-icon"></i>
            </button></div>
        </div>
        <div class="custom-collapsible-content">
            <div class="input-group mb-2">
                <div class="input-group-prepend">
                    <span class="input-group-text">Carregue uma nuvem:</span>
                </div>
                <div class="custom-file">
                    <input type="file" class="custom-file-input" id="${name}File" name="${name}File" accept=".pcd">
                    <label class="custom-file-label" for="${name}File">Clique aqui</label>
                </div>
            </div>
            <div class="d-flex mt-2 justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center">
                    <label for="${name}ColorInput" class="form-label">Cor:</label>
                    <input type="color" class="form-control form-control-color mx-2" role="button" id="${name}ColorInput" value="${c1}" title="Escolhar a cor da nuvem">
                    <label for="${name}SliderInput" class="form-label">Tamanho:</label>
                    <input type="number" min="0" max="10" class="form-control form-control mx-2" id="${name}SliderInput" value="1" step="0.1" min="0" title="Escolhar o tamanho dos pontos da nuvem">
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-secondary mx-2" id="${name}HideInput" title="Show/hide">
                        <i class="far fa-eye"></i>
                    </button>
                    <button class="btn btn-danger" id="${name}RemoveInput" title="Remover nuvem">
                        <i class="fas fa-minus-circle"></i>
                    </button>
                </div>
            </div>
            <div class="input-group input-group-lg mb-2">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-lg">Nome do arquivo</span>
                </div>
                <input type="text" id="${name}Filename" name="${name}Filename" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm">
            </div>
            <h3 class="my-1">Método para calcular a vizinhança</h3>
            <div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" id="${name}KDTreeMethodRadius" name="${name}KDTreeMethod" value="radius" ${radiusChecked}>
                    <label class="form-check-label" for="${name}KDTreeMethodRadius">Raio</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" id="${name}KDTreeMethodK" name="${name}KDTreeMethod" value="k" ${kChecked}>
                    <label class="form-check-label" for="${name}KDTreeMethodK">K Vizinhos</label>
                </div>
            </div>
            <div class="input-group input-group-lg mb-2">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-lg">Valor para calcular a vizinhança</span>
                </div>
                <input type="number" id="${name}KDTreeValue" name="${name}KDTreeValue" value="10" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm">
            </div>
            <div class="input-group input-group-lg mb-2">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-lg">Threshold mínimo</span>
                </div>
                <input type="number" id="${name}MinThreshold" name="${name}MinThreshold" value="${min}" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm">
            </div>
            <div class="input-group input-group-lg">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="inputGroup-sizing-lg">Threshold máximo</span>
                </div>
                <input type="number" id="${name}MaxThreshold" name="${name}MaxThreshold" value="${max}" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm">
            </div>
            <div class="d-flex mt-2 justify-content-between align-items-center w-100">
                <div class="d-flex align-items-center">
                    <label for="${name}Color" class="form-label">Cor:</label>
                    <input type="color" class="form-control form-control-color mx-2" role="button" id="${name}Color" value="${c2}" title="Escolhar a cor da nuvem">
                    <label for="${name}Slider" class="form-label">Tamanho:</label>
                    <input type="number" min="0" max="10" class="form-control form-control mx-2" id="${name}Slider" value="1" step="0.1" title="Escolhar o tamanho dos pontos da nuvem">
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-success" id="${name}Filter" title="Filtrar">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-primary d-none" id="${name}Loading" type="button" disabled>
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span class="sr-only">Loading...</span>
                    </button>
                    <button class="btn btn-secondary mx-2" id="${name}Hide" title="Show/hide">
                        <i class="far fa-eye"></i>
                    </button>
                    <button class="btn btn-danger" id="${name}Remove" title="Remover nuvem">
                        <i class="fas fa-minus-circle"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    return pipelineFilterChild;
}
