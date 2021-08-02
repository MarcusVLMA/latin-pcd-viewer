const filterMap = {
    'Shape Index': {
        name: 'shapeIndex',
        minThreshold: -1,
        maxThreshold: 1
    },
    'Curvatura Gaussiana': {
        name: 'gaussianCurvature',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'Curvatura (Curvedness)': {
        name: 'curvedness',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'Curvatura Média': {
        name: 'meanCurvature',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'Razão das Curvaturas Principais': {
        name: 'principalCurvatureRatio',
        minThreshold: 1,
        maxThreshold: 5
    },
    'Somatório': {
        name: 'sum',
        minThreshold: 0,
        maxThreshold: 100
    },
    'Omnivariância': {
        name: 'omnivariance',
        minThreshold: 7,
        maxThreshold: 12
    },
    'Autoentropia': {
        name: 'eigenentropy',
        minThreshold: -200,
        maxThreshold: 0
    },
    'Anisotropia': {
        name: 'anisotropy',
        minThreshold: 0,
        maxThreshold: 1
    },
    'Planaridade': {
        name: 'planarity',
        minThreshold: 0,
        maxThreshold: 1

    },
    'Linearidade': {
        name: 'linearity',
        minThreshold: 0,
        maxThreshold: 1
    },
    'Esfericidade': {
        name: 'sphericity',
        minThreshold: 0,
        maxThreshold: 1
    },
    'Variação de Superfície': {
        name: 'surfaceVariation',
        minThreshold: 0,
        maxThreshold: 1
    },
    'Verticalidade': {
        name: 'verticality',
        minThreshold: 0,
        maxThreshold: 1
    }
};

const inverseFilterMap = {
    'shapeIndex': {
        label: 'Shape Index',
        minThreshold: -1,
        maxThreshold: 1
    },
    'gaussianCurvature': {
        label: 'Curvatura Gaussiana',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'curvedness': {
        label: 'Curvatura (Curvedness)',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'meanCurvature': {
        label: 'Curvatura Média',
        minThreshold: 0,
        maxThreshold: 0.02
    },
    'principalCurvatureRatio': {
        label: 'Razão das Curvaturas Principais',
        minThreshold: 1,
        maxThreshold: 5
    },
    'sum': {
        label: 'Somatório',
        minThreshold: 0,
        maxThreshold: 100
    },
    'omnivariance': {
        label: 'Omnivariância',
        minThreshold: 7,
        maxThreshold: 12
    },
    'eigenentropy': {
        label: 'Autoentropia',
        minThreshold: -200,
        maxThreshold: 0
    },
    'anisotropy': {
        label: 'Anisotropia',
        minThreshold: 0,
        maxThreshold: 1
    },
    'planarity': {
        label: 'Planaridade',
        minThreshold: 0,
        maxThreshold: 1

    },
    'linearity': {
        label: 'Linearidade',
        minThreshold: 0,
        maxThreshold: 1
    },
    'sphericity': {
        label: 'Esfericidade',
        minThreshold: 0,
        maxThreshold: 1
    },
    'surfaceVariation': {
        label: 'Variação de Superfície',
        minThreshold: 0,
        maxThreshold: 1
    },
    'verticality': {
        label: 'Verticalidade',
        minThreshold: 0,
        maxThreshold: 1
    }
};

export {
    filterMap,
    inverseFilterMap
};
