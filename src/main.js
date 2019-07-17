const mongoose = require('mongoose');

/**
 * 
 * @param {Array<any>} db - Connection URI and diretory to models according to DB
 * @param {Object} query - Crud action, entity that will receive the action, object to populate entity if needed and conditions to populate if needed
 */
const crud = async (db = [], query = {}) => {
    return new Promise((resolve, reject) => {
        try {
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
        } catch (error) {
            reject(error);
        }
    })
}

const create = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                const connect = mongoose.connect(db[index].connection, {
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

const read = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if(!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connection, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);
                        
                        modelConnected
                            .find(query.conditions)
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

const update = (db, query, index = 0) => {
    return new Promise((resolve, reject) => {
        try {
            if (db[index].name === 'mongodb') {
                if(!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connection, {
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
                if(!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connection, {
                    useNewUrlParser: true
                });
                connect
                    .then(resConnection => {
                        const modelSchema = require((db[index]['modelsDirectory'].substr(-1) === '/') ? db[index]['modelsDirectory'] + query['entity'].toLowerCase() : db[index]['modelsDirectory'] + '/' + query['entity'].toLowerCase());
                        const modelConnected = resConnection.model(query.entity, modelSchema);
                        
                        modelConnected
                            .updateMany(query.conditions, {deletedAt: new Date()})
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
                if(!query.conditions) {
                    // TO-DO - updateWithoutCondition
                    resolve('No updates without conditions today');
                    return false;
                }
                const connect = mongoose.connect(db[index].connection, {
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

module.exports = {
    crud
}