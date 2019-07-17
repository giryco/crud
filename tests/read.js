const crudPackage = require('../index');

const db = [{
    name: "mongodb",
    connection: "mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true",
    modelsDirectory: "/home/ofm/Projects/models/mongoose/"
}];

const query = {
    action: "read",
    entity: "User",
    conditions: {
        username: new RegExp(/[a-z]*li/, 'i')
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej['message']);
    })