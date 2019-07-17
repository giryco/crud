const crudPackage = require('../index');

const db = [{
    name: "mongodb",
    connection: "mongodb+srv://giryco:GiRyCo@2019QD@moderatoro-uo7is.gcp.mongodb.net/moderatoro?retryWrites=true",
    modelsDirectory: "/home/ofm/Projects/models/mongoose/"
}];

const query = {
    action: "update",
    entity: "User",
    object: {
        username: "thalita",
        password: "17003122b89ccb2a3d7d4970de0d91ae",
        email: "thalitaxavier81@gmail.com"
    },
    conditions: {
        username: "thalita1"
    }
};

crudPackage.crud(db, query)
    .then(res => {
        console.log(res);
    })
    .catch(rej => {
        console.log(rej['message']);
    })