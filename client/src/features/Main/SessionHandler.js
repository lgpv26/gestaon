import _ from "lodash";
import { Howl } from "howler";
import Vue from "vue";
import async from "async";
import io from "socket.io-client";
import ss from "socket.io-stream";
import VueSocketio from "vue-socket.io";
import moment from "moment";
import elasticlunr from "elasticlunr";
import UsersAPI from "../../api/users";
import Dexie from "dexie";
import nGram from "n-gram";
import pako from "pako";
import allModels from "../../vuex/models/index";
import FlexSearch from 'flexsearch'

import utils from "../../utils";
import localForage from "localforage";
import config from "../../config";
import store from "../../vuex/store"

const alarmSound = require("../../assets/sounds/alarm.mp3");

export default {
    data() {
        return {
            currentImportedFileSize: 0,
            importFileSize: 0,
            stream: null,
            requestQueueInitialized: false,

            importEventOccurred: false
        };
    },
    methods: {
        /**
         * Socket.IO
         */
        initializeSocketIO() {
            const socket = io(
                config.socketServer + "?token=" + this.tokens.accessToken
            );
            Vue.use(VueSocketio, socket);
        },
        socketMethods() {
            const vm = this;
            return {
                reconnect() {
                    vm.stopLoading();
                    console.log("Reconnected.");
                },
                disconnect(reason) {
                    vm.$socket.removeListener("presence:load", vm.onPresenceLoad)
                    vm.$socket.removeListener("import", vm.onImportFromLastDataSyncedDate)
                    vm.$socket.removeListener("import", vm.onImportForTheFirstTime)
                    /*
                    vm.setLoadingText("Desconectado.");
                    vm.startLoading();
                    console.log("Disconnected from socket server. Reason: ", reason);*/
                },
                reconnectAttempt(attemptNumber) {
                    /*vm.setLoadingText("Tentando reconectar (" + attemptNumber + ").");
                    vm.startLoading();
                    console.log("Trying reconnection.");*/
                }
            };
        },
        onPresenceLoad(ev) {
            console.log("Received presence:load", ev);
            if (ev.success) {
                this.setConnectedUsers(ev.evData);
            }
        },

        /**
         * On user connect
         */
        connect() {
            const vm = this;
            vm.$socket.on("presence:load", vm.onPresenceLoad)
            if(vm.importEventOccurred) return
            vm.importEventOccurred = true
            new Promise(resolve => {
                window.setAppLoadingText("Carregando usuário...");
                vm.setAuthUser()
                    .then(() => {
                        vm.menuList = _.filter(vm.menuList, menuItem => {
                            if (menuItem.type === "system") {
                                if (menuItem.onlyAdmin && vm.user.type === "admin") {
                                    return true;
                                } else if (!menuItem.onlyAdmin) {
                                    return true;
                                }
                            }
                        });
                        vm.user.userCompanies.forEach(userCompany => {
                            vm.menuList.unshift({
                                text: userCompany.company.name,
                                type: "company",
                                action: () => {
                                    console.log("Feature yet to be implemented");
                                },
                                param: userCompany
                            });
                        });
                        console.log("Authenticated user set.");
                        resolve("Authenticated user set.");
                    })
                    .catch(() => {
                        window.removeAppLoading();
                        vm.stopLoading();
                        console.log("Couldn't get authenticated user.");
                        vm.logout();
                    });
            }).then(() => {
                vm.initializeSystem();
            });
        },

        initializeSystem() {
            const vm = this;
            /*
             * if db imported previously
             * */
            if (vm.lastDataSyncedDate) {
                console.log(
                    "Última data de sincronização",
                    moment(vm.lastDataSyncedDate).format("DD/MM/YYYY HH:mm:ss")
                );
                window.setAppLoadingText(`Carregando dados...`);
                vm.stream = ss.createStream();
                ss(vm.$socket).emit("import", vm.stream, {
                    dateLastSynced: vm.lastDataSyncedDate
                });
                vm.$socket.on("import", vm.onImportFromLastDataSyncedDate)
            } else {
                // no clients
                console.log("Primeira importação.");
                vm.stream = ss.createStream()
                ss(vm.$socket).emit("import", vm.stream);
                vm.$socket.on("import", vm.onImportForTheFirstTime)
            }
        },

        onImportForTheFirstTime(ev){
            console.log("Import event received", ev);
            const vm = this
            vm.importFileSize = ev.fileSize;
            const arrayOfChunks = [];
            vm.stream.on("data", function(chunk) {
                vm.currentImportedFileSize += chunk.length;
                arrayOfChunks.push(chunk);
                const pct = Math.floor(
                    (vm.currentImportedFileSize / vm.importFileSize) * 100
                );
                window.setAppLoadingText(
                    `Baixando BD (${vm.currentImportedFileSize}/${
                        vm.importFileSize
                        }): ${pct}%`
                );
            });
            vm.stream.on("end", function() {
                window.setAppLoadingText(`Preparando dados...`);
                async.waterfall(
                    [
                        async.asyncify(() => {
                            const input = ss.Buffer.concat(arrayOfChunks);
                            let output = pako.ungzip(input, {
                                to: "string"
                            });
                            return JSON.parse(output);
                        }),
                        async.asyncify(downloadedData => {
                            vm.$db.users.bulkPut(downloadedData.users);
                            vm.$db.clients.bulkPut(downloadedData.clients);
                            vm.$db.addresses.bulkPut(downloadedData.addresses);
                            vm.$db.clientPhones.bulkPut(downloadedData.clientPhones);
                            vm.$db.clientAddresses.bulkPut(
                                downloadedData.clientAddresses
                            );
                            vm.$db.products.bulkPut(downloadedData.products);
                            vm.$db.promotionChannels.bulkPut(
                                downloadedData.promotionChannels
                            );
                            vm.$db.clientGroups.bulkPut(downloadedData.clientGroups);
                            vm.$db.customFields.bulkPut(downloadedData.customFields);
                            vm.$db.paymentMethods.bulkPut(downloadedData.paymentMethods);
                            console.log("Data imported to indexedDB", downloadedData);
                            return downloadedData;
                        })
                    ],
                    (err, downloadedData) => {
                        const processChunkOfClients = function(chunkOfClients) {
                            return new Promise((resolve, reject) => {
                                const arrayToIndex = [];
                                async.each(
                                    chunkOfClients,
                                    (client, cb) => {
                                        vm.$db.clientAddresses
                                            .where("clientId")
                                            .equals(client.id)
                                            .toArray()
                                            .then(clientAddresses => {
                                                if (clientAddresses.length) {
                                                    Promise.all(
                                                        clientAddresses.map(clientAddress => {
                                                            return vm.$db.addresses
                                                                .get(clientAddress.addressId)
                                                                .then(address => {
                                                                    arrayToIndex.push({
                                                                        id: client.id + "#" + _.get(clientAddress, "id", 0),
                                                                        name: client.name,
                                                                        address: _.get(address, "name", null),
                                                                        neighborhood: _.get(
                                                                            address,
                                                                            "neighborhood",
                                                                            null
                                                                        ),
                                                                        number: _.get(
                                                                            clientAddress,
                                                                            "number",
                                                                            false
                                                                        )
                                                                            ? "" + _.get(clientAddress, "number")
                                                                            : null,
                                                                        complement: _.get(
                                                                            clientAddress,
                                                                            "complement",
                                                                            null
                                                                        ),
                                                                        city: _.get(address, "city", null),
                                                                        state: _.get(address, "state", null)
                                                                    });
                                                                    return address;
                                                                });
                                                        })
                                                    ).then(() => {
                                                        cb(null, client);
                                                    });
                                                } else {
                                                    arrayToIndex.push({
                                                        id: client.id + "#" + 0,
                                                        name: client.name,
                                                        address: null,
                                                        neighborhood: null,
                                                        number: null,
                                                        complement: null,
                                                        city: null,
                                                        state: null
                                                    });
                                                    cb(null, client);
                                                }
                                            });
                                    },
                                    (err, clients) => {
                                        resolve(arrayToIndex);
                                    }
                                );
                            });
                        };
                        const processChunkOfAddresses = function(chunkOfAddresses) {
                            return new Promise((resolve, reject) => {
                                const arrayToIndex = [];
                                async.each(
                                    chunkOfAddresses,
                                    (address, cb) => {
                                        arrayToIndex.push({
                                            id: address.id,
                                            name: _.get(address, "name", null),
                                            address: _.get(address, "name", null),
                                            neighborhood: _.get(address, "neighborhood", null),
                                            city: _.get(address, "city", null),
                                            state: _.get(address, "state", null),
                                            cep: _.get(address, "cep", null),
                                            country: _.get(address, "country", null)
                                        });
                                        cb(null, address);
                                    },
                                    (err, addresses) => {
                                        resolve(arrayToIndex);
                                    }
                                );
                            });
                        };

                        // begin clients import

                        vm.$db.clients
                            .count()
                            .then(numberOfClients => {
                                return new Promise((resolve, reject) => {
                                    let resultArray = [];
                                    let offset = 0,
                                        limit = 100;
                                    const processInChunks = function() {
                                        if (offset > numberOfClients) {
                                            return resolve(resultArray);
                                        }
                                        window.setAppLoadingText(
                                            `Carregando clientes: ${Math.round(
                                                (offset / numberOfClients) * 100
                                            )}%`
                                        );
                                        vm.$db.clients
                                            .offset(offset)
                                            .limit(limit)
                                            .toArray()
                                            .then(clients => {
                                                processChunkOfClients(clients).then(
                                                    processedChunkOfClients => {
                                                        resultArray = _.concat(
                                                            resultArray,
                                                            processedChunkOfClients
                                                        );
                                                        offset += limit;
                                                        processInChunks();
                                                    }
                                                );
                                            });
                                    };
                                    processInChunks();
                                });
                            })
                            .then(documents => {
                                vm.$db.searchClients.bulkPut(documents);

                                // begin addresses import

                                vm.$db.addresses
                                    .count()
                                    .then(numberOfAddresses => {
                                        return new Promise((resolve, reject) => {
                                            let resultArray = [];
                                            let offset = 0,
                                                limit = 100;
                                            const processInChunks = function() {
                                                if (offset > numberOfAddresses) {
                                                    return resolve(resultArray);
                                                }
                                                window.setAppLoadingText(
                                                    `Carregando endereços: ${Math.round(
                                                        (offset / numberOfAddresses) * 100
                                                    )}%`
                                                );
                                                vm.$db.addresses
                                                    .offset(offset)
                                                    .limit(limit)
                                                    .toArray()
                                                    .then(addresses => {
                                                        processChunkOfAddresses(addresses).then(
                                                            processedChunkOfAddresses => {
                                                                resultArray = _.concat(
                                                                    resultArray,
                                                                    processedChunkOfAddresses
                                                                );
                                                                offset += limit;
                                                                processInChunks();
                                                            }
                                                        );
                                                    });
                                            };
                                            processInChunks();
                                        });
                                    })
                                    .then(documents => {
                                        vm.$db.searchAddresses.bulkPut(documents);
                                        vm.beforeSystemInitialization().then(() => {
                                            // initialize
                                            if (window.isAppLoading()) {
                                                window.removeAppLoading();
                                            }
                                            vm.stopLoading();
                                            vm.setLastDataSyncedDate(moment().valueOf());
                                            vm.setSystemInitialized(true);
                                            vm.onSystemInitialized();
                                        });
                                    });
                            });
                    }
                );
            });
        },

        onImportFromLastDataSyncedDate(ev){
            console.log("Import event received", ev);
            const vm = this

            vm.importFileSize = ev.fileSize;
            const arrayOfChunks = [];
            vm.stream.on("data", function(chunk) {
                vm.currentImportedFileSize += chunk.length;
                arrayOfChunks.push(chunk);
                const pct = Math.floor(
                    (vm.currentImportedFileSize / vm.importFileSize) * 100
                );
                window.setAppLoadingText(
                    `Baixando BD (${vm.currentImportedFileSize}/${
                        vm.importFileSize
                        }): ${pct}%`
                );
            });
            vm.stream.on("end", function() {
                window.setAppLoadingText(`Preparando dados...`);
                async.waterfall(
                    [
                        async.asyncify(() => {
                            const input = ss.Buffer.concat(arrayOfChunks);
                            let output = pako.ungzip(input, {
                                to: "string"
                            })
                            return JSON.parse(output)
                        }),
                        async.asyncify(downloadedData => {
                            vm.$db.users.bulkPut(downloadedData.users)
                            vm.$db.clients.bulkPut(downloadedData.clients)
                            vm.$db.addresses.bulkPut(downloadedData.addresses)
                            vm.$db.clientPhones.bulkPut(downloadedData.clientPhones)
                            vm.$db.clientAddresses.bulkPut(downloadedData.clientAddresses)
                            vm.$db.products.bulkPut(downloadedData.products)
                            vm.$db.promotionChannels.bulkPut(downloadedData.promotionChannels)
                            vm.$db.clientGroups.bulkPut(downloadedData.clientGroups)
                            vm.$db.customFields.bulkPut(downloadedData.customFields)
                            vm.$db.paymentMethods.bulkPut(downloadedData.paymentMethods)
                            console.log("New data imported to indexedDB", downloadedData)
                            return downloadedData
                        })
                    ],
                    (err, downloadedData) => {
                        const clientsWithChanges = []
                        _.forEach(downloadedData.clients, client => {
                            clientsWithChanges.push(client.id)
                        })
                        _.forEach(downloadedData.clientPhones, clientPhone => {
                            clientsWithChanges.push(clientPhone.clientId)
                        })
                        _.forEach(downloadedData.clientAddresses, clientAddress => {
                            clientsWithChanges.push(clientAddress.clientId)
                        })
                        if(clientsWithChanges.length) console.log("Clients with changes", clientsWithChanges)
                        const addressesWithChanges = []
                        _.forEach(downloadedData.addresses, addresses => {
                            addressesWithChanges.push(addresses.id)
                        })
                        if(addressesWithChanges.length) console.log("Addresses with changes", addressesWithChanges)
                        const processChunkOfClients = function(chunkOfClients) {
                            return new Promise((resolve, reject) => {
                                const arrayToIndex = [];
                                async.each(chunkOfClients, (client, cb) => {
                                    vm.$db.clientAddresses.where("clientId").equals(client.id).toArray().then(clientAddresses => {
                                        if (clientAddresses.length) {
                                            Promise.all(clientAddresses.map(clientAddress => {
                                                return vm.$db.addresses.get(clientAddress.addressId).then(address => {
                                                    arrayToIndex.push({
                                                        id: client.id + "#" + _.get(clientAddress, "id", 0),
                                                        name: client.name,
                                                        address: _.get(address, "name", null),
                                                        neighborhood: _.get(address, "neighborhood", null),
                                                        number: _.get(clientAddress, "number", false) ? "" + _.get(clientAddress, "number") : null,
                                                        complement: _.get(clientAddress, "complement", null),
                                                        city: _.get(address, "city", null),
                                                        state: _.get(address, "state", null)
                                                    })
                                                    return address
                                                })
                                            })).then(() => {
                                                cb(null, client)
                                            })
                                        }
                                        else {
                                            arrayToIndex.push({
                                                id: client.id + "#" + 0,
                                                name: client.name,
                                                address: null,
                                                neighborhood: null,
                                                number: null,
                                                complement: null,
                                                city: null,
                                                state: null
                                            })
                                            cb(null, client)
                                        }
                                    })
                                }, (err, clients) => {
                                    resolve(arrayToIndex)
                                })
                            })
                        }
                        const processChunkOfAddresses = function(chunkOfAddresses) {
                            return new Promise((resolve, reject) => {
                                const arrayToIndex = [];
                                async.each(
                                    chunkOfAddresses,
                                    (address, cb) => {
                                        arrayToIndex.push({
                                            id: address.id,
                                            name: _.get(address, "name", null),
                                            address: _.get(address, "name", null),
                                            neighborhood: _.get(address, "neighborhood", null),
                                            city: _.get(address, "city", null),
                                            state: _.get(address, "state", null),
                                            cep: _.get(address, "cep", null),
                                            country: _.get(address, "country", null)
                                        });
                                        cb(null, address);
                                    },
                                    (err, addresses) => {
                                        resolve(arrayToIndex);
                                    }
                                );
                            });
                        };

                        // begin clients import

                        return new Promise((resolve, reject) => {
                            let resultArray = [];
                            let offset = 0,
                                limit = 100;
                            const processInChunks = function() {
                                if (offset >= clientsWithChanges.length) {
                                    return resolve(resultArray);
                                }
                                window.setAppLoadingText(
                                    `Carregando clientes: ${Math.round(
                                        (offset / clientsWithChanges.length) * 100
                                    )}%`
                                );
                                vm.$db.clients.where("id").anyOf(clientsWithChanges).offset(offset).limit(limit).toArray().then(clients => {
                                    processChunkOfClients(clients).then(
                                        processedChunkOfClients => {
                                            resultArray = _.concat(
                                                resultArray,
                                                processedChunkOfClients
                                            );
                                            offset += limit;
                                            processInChunks();
                                        }
                                    )
                                })
                            }
                            processInChunks();
                        }).then(clientDocuments => {
                            // begin addresses import
                            return new Promise((resolve, reject) => {
                                let resultArray = [];
                                let offset = 0,
                                    limit = 100;
                                const processInChunks = () => {
                                    if (offset >= addressesWithChanges.length) {
                                        return resolve(resultArray);
                                    } else {
                                        window.setAppLoadingText(
                                            `Carregando endereços: ${Math.round(
                                                (offset / addressesWithChanges.length) * 100
                                            )}%`
                                        )
                                        vm.$db.addresses.where("id").anyOf(addressesWithChanges).offset(offset).limit(limit).toArray().then(addresses => {
                                            processChunkOfAddresses(addresses).then(
                                                processedChunkOfAddresses => {
                                                    resultArray = _.concat(
                                                        resultArray,
                                                        processedChunkOfAddresses
                                                    );
                                                    offset += limit
                                                    processInChunks()
                                                }
                                            )
                                        })
                                    }
                                }
                                processInChunks()
                            }).then(addressDocuments => {
                                window.setAppLoadingText(`Preparando dados...`)
                                vm.$db.searchClients.bulkPut(clientDocuments)
                                vm.$db.searchAddresses.bulkPut(addressDocuments)
                                vm.beforeSystemInitialization().then(() => {
                                    // initialize
                                    if (window.isAppLoading()) {
                                        window.removeAppLoading()
                                    }
                                    vm.stopLoading()
                                    vm.setLastDataSyncedDate(moment().valueOf())
                                    vm.setSystemInitialized(true)
                                    vm.onSystemInitialized()
                                })
                            })
                        })
                    }
                )
            })
        },

        beforeSystemInitialization(){
            const vm = this
            return Promise.all([
                /**
                 * load elasticlunar search data
                 */
                new Promise((resolve, reject) => {
                    vm.$static.fSearchClients = new FlexSearch({
                        doc: {
                            id: "id",
                            field: [
                                "name",
                                "address",
                                "complement",
                                "number",
                                "neighborhood",
                                "city",
                                "state"
                            ]
                        },
                        encode: 'simple',
                        tokenize: 'forward',
                        async: true,
                        worker: false,
                        suggest: true
                    })
                    vm.$db.searchClients.toArray().then(documents => {
                        vm.$static.fSearchClients.add(documents)
                        resolve();
                    })

                }),
                new Promise((resolve, reject) => {
                    vm.$static.fSearchAddresses = new FlexSearch({
                        doc: {
                            id: "id",
                            field: [
                                "name",
                                "address",
                                "neighborhood",
                                "city",
                                "state",
                                "cep",
                                "country"
                            ]
                        },
                        encode: 'simple',
                        tokenize: 'forward',
                        async: true,
                        worker: false,
                        suggest: true
                    })
                    vm.$db.searchAddresses.toArray().then(documents => {
                        vm.$static.fSearchAddresses.add(documents);
                        resolve();
                    })
                }),
                /**
                 * load vuex orm data
                 */
                new Promise((resolve, reject) => {
                    vm.$db.products.toArray().then(products => {
                        vm.$store.dispatch("entities/products/insert", {
                            data: products
                        });
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    vm.$db.paymentMethods.toArray().then(paymentMethods => {
                        vm.$store.dispatch("entities/paymentMethods/insert", {
                            data: paymentMethods
                        });
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    vm.$db.promotionChannels.toArray().then(promotionChannels => {
                        vm.$store.dispatch("entities/promotionChannels/insert", {
                            data: promotionChannels
                        });
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    vm.$db.users.toArray().then(users => {
                        vm.$store.dispatch("entities/users/insert", {
                            data: users
                        });
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    vm.$db.clientGroups.toArray().then(users => {
                        vm.$store.dispatch("entities/clientGroups/insert", {
                            data: users
                        });
                        resolve();
                    });
                })
            ]);
        },

        /**
         * Logout
         */

        logout() {
            const vm = this;
            vm.logoutAction().then(authenticated => {
                if (!authenticated) {
                    vm.$db.delete().then(() => {
                        console.log("Everything cleaned");
                        localStorage.removeItem("vuex");
                        Vue.prototype.$db = new Dexie("db");
                        vm.$db.version(1).stores({
                            ...vm.modelDefinitions.searchModels,
                            ...vm.modelDefinitions.offlineDBModels,
                            ...vm.modelDefinitions.stateModels
                        });
                        vm.resetRequestQueueState();
                        vm.resetChatQueueState();
                        vm.$store.dispatch("entities/deleteAll");
                        vm.setSystemInitialized(false);
                        vm.setLastDataSyncedDate(null);
                        vm.setLastRequestsLoadedDate(null);
                        location.reload()
                    });
                }
            });
        }
    },
    mounted() {
        const vm = this;
        vm.importEventOccurred = false
        localStorage.debug = false;
        /* start socket.io */
        this.initializeSocketIO();
        /* if user disconnected / reconnected from socket server */
        this.$socket.on("reconnect_attempt", vm.socketMethods().reconnectAttempt);
        this.$socket.on("disconnect", vm.socketMethods().disconnect);
        this.$socket.on("connect", vm.connect);
    }
};
