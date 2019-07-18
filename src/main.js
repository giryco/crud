// Vendors
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

// Packages
const createDocumentPackage = require('../../create-document/index');
const readDocumentPackage = require('../../read-document/index');

/**
 * 
 * @param {Array<any>} db - Connection URI and diretory to models according to DB
 * @param {Object} query - Crud action, entity that will receive the action, object to populate entity if needed and conditions to populate if needed
 */
const crud = (db = [], query = {}) => {
    return new Promise((resolve, reject) => {
        try {
            const permissionArray = [];
            for (let i = 0; i < db.length; i++) {
                const object = db[i];

                for (const key in object) {
                    if (object.hasOwnProperty(key)) {
                        const element = object[key];

                        if (key === 'permission') {
                            permissionArray.push(element);
                        }
                    }
                }
            }

            if (permissionArray.length > 0) {
                const queryToPermission = {
                    action: 'read',
                    entity: 'Permission',
                    object: {
                        User_id: permissionArray[0].User_id,
                        crud: 'create',
                        entity: 'User'
                    }
                }

                permission(db, queryToPermission)
                    .then(res => {
                        console.log(res);
                        if (res.length < 1) {
                            resolve(res);
                        } else {
                            if (query.action === 'create') {
                                create(db, query)
                                    .then(res => {
                                        resolve(res);
                                    })
                                    .catch(rej => {
                                        reject(rej);
                                    });
                            }

                            if (query.action === 'read') {
                                read(db, query)
                                    .then(res => {
                                        resolve(res);
                                    })
                                    .catch(rej => {
                                        reject(rej);
                                    })
                            }

                            if (query.action === 'update') {
                                update(db, query)
                                    .then(res => {
                                        resolve(res);
                                    })
                                    .catch(rej => {
                                        reject(rej);
                                    })
                            }

                            if (query.action === 'hardDelete') {
                                hardDelete(db, query)
                                    .then(res => {
                                        resolve(res);
                                    })
                                    .catch(rej => {
                                        reject(rej);
                                    })
                            }

                            if (query.action === 'softDelete') {
                                softDelete(db, query)
                                    .then(res => {
                                        resolve(res);
                                    })
                                    .catch(rej => {
                                        reject(rej);
                                    })
                            }
                        }
                    })
                    .catch(rej => {
                        reject(rej);
                    })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const create = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);
                        const modelObject = new modelConnected(query.object);
                        const modelError = modelObject.validateSync();
                        const message = [];
                        if (modelError && modelError.errors) {
                            for (const key in modelError.errors) {
                                if (modelError.errors.hasOwnProperty(key)) {
                                    const errors = modelError.errors[key];
                                    for (const k in errors) {
                                        if (errors.hasOwnProperty(k)) {
                                            const error = errors[k];
                                            if (k === 'message') {
                                                message.push(error);
                                            }
                                        }
                                    }
                                }
                            }
                            resolve(message);
                            resConnection.disconnect();
                        }
                        modelConnected
                            .create(query.object)
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    create(db, query, newIndex)
                                        .then(resToRecursive => {
                                            resolve(resToRecursive);
                                            resConnection.disconnect();
                                        })
                                        .then(rejToRecursive => {
                                            reject(rejToRecursive);
                                            resConnection.disconnect();
                                        })
                                }
                                resolve(docs);
                                resConnection.disconnect();
                            })
                            .catch(error => {
                                reject(error);
                                resConnection.disconnect();
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                    });
            }

            if (db[index].name === 'linuxdb') {
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                const objectJson = JSON.stringify(query.object);
                createDocumentPackage.create(fileDirectory, collection, objectJson)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            create(db, query, newIndex)
                                .then(resToRecursive => {
                                    resolve(resToRecursive);
                                })
                                .then(rejToRecursive => {
                                    reject(rejToRecursive);
                                })
                        }
                        resolve(res);
                    })
                    .catch(rej => {
                        reject(rej)
                    })
            }

            if (db[index].name === 'sequelize') {
                const sequelize = new Sequelize(db[index].connectionUri);

                sequelize
                    .authenticate()
                    .then(() => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        modelSchema
                            .sync({
                                force: true
                            })
                            .then(() => {
                                sequelizePromise = modelSchema
                                    .create(query.object)
                                    .then(docs => {
                                        if (index < (db.length - 1)) {
                                            const newIndex = index + 1;
                                            create(db, query, newIndex)
                                                .then(resToRecursive => {
                                                    resolve(resToRecursive);
                                                    sequelize.close();
                                                })
                                                .then(rejToRecursive => {
                                                    reject(rejToRecursive);
                                                    sequelize.close();
                                                })
                                        }
                                        resolve(docs);
                                        sequelize.close();
                                    })
                                    .catch(error => {
                                        reject(error);
                                        sequelize.close();
                                    });
                                resolve(res);
                            })
                            .catch(rej => {
                                reject(rej)
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                        sequelize.close();
                    })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const read = (db, query, index = 0, result = []) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if (!query.conditions) {
                    // TO-DO - readWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);

                        modelConnected
                            .find(query.conditions)
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    read(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            resolve(resToRecursive);
                                            resConnection.disconnect();
                                        })
                                        .catch(rejToRecursive => {
                                            reject(rejToRecursive);
                                            resConnection.disconnect();
                                        })
                                } else {
                                    result.push(docs);
                                    resolve(result);
                                    resConnection.disconnect();
                                }
                            })
                            .catch(error => {
                                reject(error);
                                resConnection.disconnect();
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                    });
            }

            if (db[index].name === 'linuxdb') {
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                const objectJson = [query.conditions];

                readDocumentPackage.read(fileDirectory, collection, objectJson)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            result.push(res);
                            read(db, query, newIndex, result)
                                .then(resToRecursive => {
                                    resolve(resToRecursive);
                                })
                                .catch(rejToRecursive => {
                                    reject(rejToRecursive);
                                })
                        } else {
                            result.push(res);
                            resolve(result);
                        }
                    })
                    .catch(rej => {
                        reject(rej);
                    })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const update = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if (!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);
                        const modelObject = new modelConnected(query.object);
                        const modelError = modelObject.validateSync();
                        const message = [];
                        if (modelError && modelError.errors) {
                            for (const key in modelError.errors) {
                                if (modelError.errors.hasOwnProperty(key)) {
                                    const errors = modelError.errors[key];
                                    for (const k in errors) {
                                        if (errors.hasOwnProperty(k)) {
                                            const error = errors[k];
                                            if (k === 'message') {
                                                message.push(error);
                                            }
                                        }
                                    }
                                }
                            }
                            resolve(message);
                            resConnection.disconnect();
                        }
                        modelConnected
                            .updateMany(query.conditions, query.object)
                            .then(docs => {
                                resolve(docs);
                                resConnection.disconnect();
                            })
                            .catch(error => {
                                reject(error);
                                resConnection.disconnect();
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                    });
            }

            if (db[index].name === 'linuxdb') {
                const timestamp = Date.now();
                const filename = md5(timestamp + uniqueId + '@Anyt1nG');

                const stringToFile = JSON.stringify(object);
                if (fileDirectory.substr(-1) === '/') {
                    fs.writeFileSync(fileDirectory + filename, stringToFile);
                } else {
                    fs.writeFileSync(fileDirectory + '/' + filename, stringToFile);
                }

                let fileBuffer;

                if (fileDirectory.substr(-1) === '/') {
                    fileBuffer = fs.readFileSync(fileDirectory + filename);
                } else {
                    fileBuffer = fs.readFileSync(fileDirectory + '/' + filename);
                }

                const fileString = fileBuffer.toString();
                resolve(fileString);
            }
        } catch (error) {
            reject(error);
        }
    })
}

const softDelete = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if (!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);

                        modelConnected
                            .updateMany(query.conditions, {
                                deletedAt: new Date()
                            })
                            .then(docs => {
                                resolve(docs);
                                resConnection.disconnect();
                            })
                            .catch(error => {
                                reject(error);
                                resConnection.disconnect();
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                    });
            }

            if (db[index].name === 'linuxdb') {
                const timestamp = Date.now();
                const filename = md5(timestamp + uniqueId + '@Anyt1nG');

                const stringToFile = JSON.stringify(object);
                if (fileDirectory.substr(-1) === '/') {
                    fs.writeFileSync(fileDirectory + filename, stringToFile);
                } else {
                    fs.writeFileSync(fileDirectory + '/' + filename, stringToFile);
                }

                let fileBuffer;

                if (fileDirectory.substr(-1) === '/') {
                    fileBuffer = fs.readFileSync(fileDirectory + filename);
                } else {
                    fileBuffer = fs.readFileSync(fileDirectory + '/' + filename);
                }

                const fileString = fileBuffer.toString();
                resolve(fileString);
            }
        } catch (error) {
            reject(error);
        }
    })
}

const hardDelete = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if (!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);

                        modelConnected
                            .deleteMany(query.conditions)
                            .then(docs => {
                                resolve(docs);
                                resConnection.disconnect();
                            })
                            .catch(error => {
                                reject(error);
                                resConnection.disconnect();
                            });
                    })
                    .catch(rejConnection => {
                        reject(rejConnection['message']);
                    });
            }

            if (db[index].name === 'linuxdb') {
                const timestamp = Date.now();
                const filename = md5(timestamp + uniqueId + '@Anyt1nG');

                const stringToFile = JSON.stringify(object);
                if (fileDirectory.substr(-1) === '/') {
                    fs.writeFileSync(fileDirectory + filename, stringToFile);
                } else {
                    fs.writeFileSync(fileDirectory + '/' + filename, stringToFile);
                }

                let fileBuffer;

                if (fileDirectory.substr(-1) === '/') {
                    fileBuffer = fs.readFileSync(fileDirectory + filename);
                } else {
                    fileBuffer = fs.readFileSync(fileDirectory + '/' + filename);
                }

                const fileString = fileBuffer.toString();
                resolve(fileString);
            }
        } catch (error) {
            reject(error);
        }
    })
}

const permission = (db, query) => {
    return new Promise((resolve, reject) => {
        try {
            read(db, query)
                .then(res => {
                    resolve(res);
                })
                .catch(rej => {
                    reject(rej);
                });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    crud
}