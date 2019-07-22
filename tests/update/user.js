const crudPackage = require('../../index');

const db = [{
    name: "mongodb",
    connectionUri: "mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true",
    modelsDirectory: "/home/ofm/Projects/models/mongoose/"
},
{
    name: 'linuxdb',
    filesDirectory: '/home/ofm/Projects/resources/collections/'
}];

const query = {
    action: "update",
    entity: "User",
    object: {
        groups: [{
            Group_id: 'j3lg7o7jyeax1ox'
        }, {
            Group_id: '5d359c9576a52426d7d70ace'
        }]
    },
    conditions: {
        username: "joao"
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.info(res);
    })
    .catch(rej => {
        console.error(rej['message']);
    })