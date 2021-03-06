// Vendors
const mongoose = require('mongoose');
const Sequelize = require('sequelize');

// Packages
const createDocumentPackage = require('../../create-document/index');
const readDocumentPackage = require('../../read-document/index');
const updateDocumentPackage = require('../../update-document/index');
const deleteDocumentPackage = require('../../delete-document/index')

/**
 * 
 * @param {Array<any>} db - Connection URI and diretory to models according to DB
 * @param {Object} query - Crud action, entity that will receive the action, object to populate entity if needed and conditions to populate if needed
 */
const crud = (db = [], query = {}, index = 0, permissionArray = []) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name != 'mongodb' && db[index].name != 'linuxdb' && db[index].name != 'sequelize') {
                const result = {
                    message: 'Database option not found',
                    status: 400
                }

                resolve(result);
            }
            if (index == 0) {
                for (let i = 0; i < db.length; i++) {
                    const object = db[i];

                    for (const key in object) {
                        if (object.hasOwnProperty(key)) {
                            if (key === 'permission') {
                                permissionArray.push(object);
                            }
                        }
                    }
                }
            }

            if (permissionArray.length > 0) {
                if (permissionArray[0].permission.token) {
                    const queryToPermission = {
                        action: 'read',
                        entity: 'Token',
                        options: {
                            match: true,
                            and: true
                        },
                        conditions: {
                            _id: permissionArray[0].permission.token
                        }
                    }

                    permission([permissionArray[0]], queryToPermission, query)
                        .then(res => {
                            if (res.length < 1) {
                                const result = {
                                    message: 'Unauthorized',
                                    status: 401,
                                    result: res
                                };

                                resolve(result);
                            } else {
                                crudAction(db, query)
                                    .then(resAction => {
                                        resolve(resAction);
                                    })
                                    .catch(rejAction => {
                                        reject(rejAction);
                                    });
                            }
                        })
                        .catch(rej => {
                            if (rej['message'] == 'Nothing found') {
                                const result = {
                                    message: 'Unauthorized',
                                    status: 401,
                                    result: rej
                                };

                                resolve(result);
                            }
                            
                            const result = {
                                message: rej['message'],
                                status: 500,
                                result: rej
                            };

                            resolve(result);
                        })
                }
                
            } else {
                crudAction(db, query)
                    .then(resAction => {
                        resolve(resAction);
                    })
                    .catch(rejAction => {
                        reject(rejAction);
                    })
            }
        } catch (error) {
            reject(error);
        }
    })
}

const crudAction = (db, query) => {
    return new Promise((resolve, reject) => {
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
    })
}

const create = (db, query, index = 0, result = []) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelDirectory = (db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase();
                        const modelSchema = require(modelDirectory);
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
                            mongoose.disconnect()
                            .then(() => {
                                resolve(message);
                            })
                            .catch(rejDisconnect => {
                                reject(rejDisconnect);
                            })
                        }
                        modelConnected
                            .create(query.object)
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    create(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                resolve(resToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                        .catch(rejToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                reject(rejToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                } else {
                                    result.push(docs);
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(result);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                }
                            })
                            .catch(error => {
                                mongoose.disconnect()
                                .then(() => {
                                    reject(error);
                                })
                                .catch(rejDisconnect => {
                                    reject(rejDisconnect);
                                })
                            });
                    })
                    .catch(rejConnection => {
                        mongoose.disconnect()
                        .then(() => {
                            reject(rejConnection['message']);
                        })
                        .catch(rejDisconnect => {
                            reject(rejDisconnect);
                        })
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
                            result.push(res);
                            create(db, query, newIndex, result)
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
                    resolve('No reading without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connectionUri, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelDirectory = (db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase();
                        const modelSchema = require(modelDirectory);
                        const modelConnected = resConnection.model(query.entity, modelSchema);
                        query.conditions['_deletedAt'] = { $exists: false };
                        
                        modelConnected
                            .find({
                                $and: [query.conditions]
                            })
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    read(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                resolve(resToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                        .catch(rejToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                reject(rejToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                } else {
                                    result.push(docs);
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(result);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                }
                            })
                            .catch(error => {
                                mongoose.disconnect()
                                .then(() => {
                                    reject(error);
                                })
                                .catch(rejDisconnect => {
                                    reject(rejDisconnect);
                                })
                            });
                    })
                    .catch(rejConnection => {
                        mongoose.disconnect()
                        .then(() => {
                            reject(rejConnection['message']);
                        })
                        .catch(rejDisconnect => {
                            reject(rejDisconnect);
                        })
                    });
            }

            if (db[index].name === 'linuxdb') { // TO-DO - Work over AND and OR operators on READ
                let option = {};
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                if (query.conditions && query.conditions['_deletedAt']) delete query.conditions['_deletedAt'];
                const objectJson = query.conditions;
                if (query.option) option = query.option;
                
                readDocumentPackage.read(fileDirectory, collection, objectJson, option)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            result.push(res[0]);
                            read(db, query, newIndex, result)
                                .then(resToRecursive => {
                                    resolve(resToRecursive);
                                })
                                .catch(rejToRecursive => {
                                    reject(rejToRecursive);
                                })
                        } else {
                            Array.isArray(res) ? result.push(res[0]) : result.push(res);
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

const update = (db, query, index = 0, result = []) => {
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
                        query.conditions['_deletedAt'] = { $exists: false };
                        modelConnected
                            .updateMany({
                                $and: [query.conditions]
                            }, query.object)
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    update(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                resolve(resToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                        .catch(rejToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                reject(rejToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                } else {
                                    result.push(docs);
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(result);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                }
                            })
                            .catch(error => {
                                mongoose.disconnect()
                                .then(() => {
                                    reject(error);
                                })
                                .catch(rejDisconnect => {
                                    reject(rejDisconnect);
                                })
                            });
                    })
                    .catch(rejConnection => {
                        mongoose.disconnect()
                        .then(() => {
                            reject(rejConnection['message']);
                        })
                        .catch(rejDisconnect => {
                            reject(rejDisconnect);
                        })
                    });
            }

            if (db[index].name === 'linuxdb') {
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                if (query.conditions['_deletedAt']) delete query.conditions['_deletedAt'];
                const objectJson = query;
                
                updateDocumentPackage.update(fileDirectory, collection, objectJson)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            result.push(res);
                            update(db, query, newIndex, result)
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

const softDelete = (db, query, index = 0, result = []) => {
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
                        query.conditions['_deletedAt'] = { $exists: false };
                        modelConnected
                            .updateMany({
                                $and: [query.conditions]
                            }, {
                                _deletedAt: new Date()
                            })
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    softDelete(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                resolve(resToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                        .catch(rejToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                reject(rejToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                } else {
                                    result.push(docs);
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(result);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                }
                            })
                            .catch(error => {
                                mongoose.disconnect()
                                .then(() => {
                                    reject(error);
                                })
                                .catch(rejDisconnect => {
                                    reject(rejDisconnect);
                                })
                            });
                    })
                    .catch(rejConnection => {
                        mongoose.disconnect()
                        .then(() => {
                            reject(rejConnection['message']);
                        })
                        .catch(rejDisconnect => {
                            reject(rejDisconnect);
                        })
                    });
            }

            if (db[index].name === 'linuxdb') {
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                if (query.conditions['_deletedAt']) delete query.conditions['_deletedAt'];
                const objectJson = [query.conditions];

                deleteDocumentPackage.softDelete(fileDirectory, collection, objectJson)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            result.push(res);
                            softDelete(db, query, newIndex, result)
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

const hardDelete = (db, query, index = 0, result = []) => {
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
                        query.conditions['_deletedAt'] = { $exists: false };

                        modelConnected
                            .deleteMany({
                                $and: [query.conditions]
                            })
                            .then(docs => {
                                if (index < (db.length - 1)) {
                                    const newIndex = index + 1;
                                    result.push(docs);
                                    hardDelete(db, query, newIndex, result)
                                        .then(resToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                resolve(resToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                        .catch(rejToRecursive => {
                                            mongoose.disconnect()
                                            .then(() => {
                                                reject(rejToRecursive);
                                            })
                                            .catch(rejDisconnect => {
                                                reject(rejDisconnect);
                                            })
                                        })
                                } else {
                                    result.push(docs);
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(result);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                }
                            })
                            .catch(error => {
                                mongoose.disconnect()
                                .then(() => {
                                    reject(error);
                                })
                                .catch(rejDisconnect => {
                                    reject(rejDisconnect);
                                })
                            });
                    })
                    .catch(rejConnection => {
                        mongoose.disconnect()
                        .then(() => {
                            reject(rejConnection['message']);
                        })
                        .catch(rejDisconnect => {
                            reject(rejDisconnect);
                        })
                    });
            }

            if (db[index].name === 'linuxdb') {
                const fileDirectory = db[index]['filesDirectory'];
                const collection = query.entity.toLowerCase();
                if (query.conditions['_deletedAt']) delete query.conditions['_deletedAt'];
                const objectJson = [query.conditions];

                deleteDocumentPackage.hardDelete(fileDirectory, collection, objectJson)
                    .then(res => {
                        if (index < (db.length - 1)) {
                            const newIndex = index + 1;
                            result.push(res);
                            hardDelete(db, query, newIndex, result)
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

const permission = (db, queryToPermission, query) => {
    return new Promise((resolve, reject) => {
        try {
            read(db, queryToPermission)
                .then(res => {
                    if (res[0].groups && res[0].groups.length > 0) {
                        // TO-DO - Group validation
                        return false;
                    } else {
                        if (res[0].User_id) {
                            const newQuery = {
                                action: 'read',
                                entity: 'Permission',
                                options: {
                                    match: true,
                                    and: true
                                },
                                conditions: {
                                    User_id: res[0].User_id,
                                    crud: query.action,
                                    entity: query.entity
                                }
                            }
                            
                            read(db, newQuery)
                                .then(resPermission => {
                                    mongoose.disconnect()
                                    .then(() => {
                                        resolve(resPermission);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                })
                                .catch(rejPermission => {
                                    mongoose.disconnect()
                                    .then(() => {
                                        reject(rejPermission);
                                    })
                                    .catch(rejDisconnect => {
                                        reject(rejDisconnect);
                                    })
                                })
                        } else {
                            reject(res);
                        }
                    }
                })
                .catch(rej => {
                    mongoose.disconnect()
                    .then(() => {
                        reject(rej);
                    })
                    .catch(rejDisconnect => {
                        reject(rejDisconnect);
                    })
                });
        } catch (error) {
            mongoose.disconnect()
            .then(() => {
                reject(error);
            })
            .catch(rejDisconnect => {
                reject(rejDisconnect);
            })
        }
    })
}

module.exports = {
    crud
}