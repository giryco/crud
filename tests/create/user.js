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
            User_id: '5d30a0e536c9ad34044cc8c4'
        }
    }
];

const query = {
    action: 'create',
    entity: 'Permission',
    object: {
        User_id: '5d30a0e536c9ad34044cc8c4',
        crud: 'create',
        entity: 'User'
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej['message']);
    })