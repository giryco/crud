const crudPackage = require('../../index');

const db = [
    {
        name: "mongodb",
        connectionUri: "mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true",
        modelsDirectory: "/home/ofm/Projects/models/mongoose/"
    },
    {
        name: 'linuxdb',
        filesDirectory: '/home/ofm/Projects/resources/collections/'
    }
];

const query = {
    action: "read",
    entity: "Country",
    conditions: {
        name: new RegExp(/[a-z]*ganis/, 'i')
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.info(res);
    })
    .catch(rej => {
        console.error(rej['message']);
    })