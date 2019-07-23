const crudPackage = require('../../index');

const db = [
    {
        name: 'mongodb',
        connectionUri: 'mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true',
        modelsDirectory: '/home/ofm/Projects/models/mongoose/'
    }, 
    {
        name: 'linuxdb',
        filesDirectory: '/home/ofm/Projects/resources/collections/',
        permission: {
            token: 'j3lgm08jyekawcv'
        }
    }
];

const query = {
    action: 'create',
    entity: 'Country',
    object: {
        name: 'Ilhas de Aland',
        officialName: 'Aland',
        numericCode: '248',
        alpha2Code: 'AX',
        alpha3Code: 'ALA',
        cctld: '.al'
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.info(res);
    })
    .catch(rej => {
        console.error(rej['message']);
    })