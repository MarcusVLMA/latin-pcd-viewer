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

const landmarksMap = [
    {
        name: 'Outer left eyebrow',
        label: 'landmarkOuterLeftEyebrow'
    },
    {
        name: 'Middle left eyebrow',
        label: 'landmarkMiddleLeftEyebrow'
    },
    {
        name: 'Inner left eyebrow',
        label: 'landmarkInnerLeftEyebrow'
    },
    {
        name: 'Inner right eyebrow',
        label: 'landmarkInnerRightEyebrow'
    },
    {
        name: 'Middle right eyebrow',
        label: 'landmarkMiddleRightEyebrow'
    },
    {
        name: 'Outer right eyebrow',
        label: 'landmarkOuterRightEyebrow'
    },
    {
        name: 'Outer left eye corner',
        label: 'landmarkOuterLeftEyeCorner'
    },
    {
        name: 'Inner left eye corner',
        label: 'landmarkInnerLeftEyeCorner'
    },
    {
        name: 'Inner right eye corner',
        label: 'landmarkInnerRightEyeCorner'
    },
    {
        name: 'Outer right eye corner',
        label: 'landmarkOuterRightEyeCorner'
    },
    {
        name: 'Nose saddle left',
        label: 'landmarkNoseSaddleLeft'
    },
    {
        name: 'Nose saddle right',
        label: 'landmarkNoseSaddleRight'
    },
    {
        name: 'Left nose peak',
        label: 'landmarkLeftNosePeak'
    },
    {
        name: 'Nose tip',
        label: 'landmarkNoseTip'
    },
    {
        name: 'Right nose peak',
        label: 'landmarkRightNosePeak'
    },
    {
        name: 'Left mouth corner',
        label: 'landmarkLeftMouthCorner'
    },
    {
        name: 'Upper lip outer middle',
        label: 'landmarkUpperLipOuterMiddle'
    },
    {
        name: 'Right mouth corner',
        label: 'landmarkRightMouthCorner'
    },
    {
        name: 'Upper lip inner middle',
        label: 'landmarkUpperLipInnerMiddle'
    },
    {
        name: 'Lower lip inner middle',
        label: 'landmarkLowerLipInnerMiddle'
    },
    {
        name: 'Lower lip outer middle',
        label: 'landmarkLowerLipOuterMiddle'
    },
    {
        name: 'Chin middle',
        label: 'landmarkChinMiddle'
    },
    {
        name: 'Left ear lobe',
        label: 'landmarkLeftEarLobe'
    },
    {
        name: 'Right ear lobe',
        label: 'landmarkRightEarLobe'
    },
];

export {
    filterMap,
    inverseFilterMap,
    landmarksMap
};
