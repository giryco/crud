const crudPackage = require('../index');

const db = [{
    name: "mongodb",
    connectionUri: "mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true",
    modelsDirectory: "/home/ofm/Projects/models/mongoose/"
}];

const query = {
    action: "hardDelete",
    entity: "User",
    conditions: {
        username: "thalita"
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej['message']);
    })