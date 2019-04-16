import _ from "lodash"
import Vue from "vue"
import async from "async"
import ss from "socket.io-stream"
import moment from "moment"
import shortid from "shortid"
import pako from "pako"

export default {
    data() {
        return {
            currentImportedFileSize: 0,
            importFileSize: 0,
            stream: null,
            requestQueueInitialized: false,

            importEventRequestedDate: null,
            importEventOccurred: false
        };
    },
    methods: {
        /**
         * Socket.IO
         */
        initializeSocketIO() {
            const vm = this
            vm.$socket.io.opts.query = {
                token: vm.tokens.accessToken
            }
            vm.$socket.open()
            vm.$socket.on('connect', vm.connect);
            vm.$socket.on('disconnect', (reason) => {
                console.log('Socket disconnected.', reason)
            })
            vm.$socket.on('reconnect', () => {
                console.log('Socket reconnected.')
                /*
                 * if db imported previously
                 * */
                if (vm.lastDataSyncedDate) {
                    vm.importFromLastDataSyncedDate()
                }
            })
        },

        async connect(){
            const vm = this;
            console.log('Socket connected.')
            vm.$socket.on("presence:load", vm.onPresenceLoad)
            //vm.$socket.on("request-queue:sync", )
            vm.$socket.on("request-queue:sync", vm.pushToRequestQueueSyncAcumulator)
            if(vm.importEventOccurred) return
            vm.importEventOccurred = true
            let authenticatedUser = null
            vm.importEventRequestedDate = moment().valueOf()
            try {
                authenticatedUser = await new Promise(async resolve => {
                    window.setAppLoadingText("Carregando usuário...");
                    const authenticatedUser = await vm.setAuthUser()
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
                    resolve(authenticatedUser);
                })
            }
            catch(err){
                window.removeAppLoading();
                vm.stopLoading();
                console.log("Couldn't get authenticated user.");
                vm.logout();
            }
            /*
             * if db imported previously
             * */
            if (vm.lastDataSyncedDate) {
                console.log("Última data de sincronização", moment(vm.lastDataSyncedDate).format("DD/MM/YYYY HH:mm:ss"))
                window.setAppLoadingText(`Importando dados novos...`)
                ss(vm.$socket).emit("import", vm.stream, { dateLastSynced: vm.lastDataSyncedDate})
                vm.$socket.on("import", this.onImportFromLastDataSyncedDate)
                return
            }
            // if this is the first importation
            console.log("Primeira importação.")
            window.setAppLoadingText(`Preparando dados para importação...`)
            ss(vm.$socket).emit("import", vm.stream)
            vm.$socket.on("import", this.onImportForTheFirstTime)
        },

        onPresenceLoad(ev) {
            console.log("Received presence:load", ev);
            if (ev.success) {
                this.setConnectedUsers(ev.evData);
            }
        },
        onImportForTheFirstTime(ev){
            console.log("First import event received", ev)
            const vm = this
            vm.importFileSize = ev.fileSize
            const arrayOfChunks = []

            vm.stream.on("data", (chunk) => {
                vm.currentImportedFileSize += chunk.length
                arrayOfChunks.push(chunk);
                const pct = Math.floor((vm.currentImportedFileSize / vm.importFileSize) * 100)
                window.setAppLoadingText(`Baixando banco de dados (${vm.currentImportedFileSize}/${vm.importFileSize}): ${pct}%`)
            })
            vm.stream.on("end", async () => {
                window.setAppLoadingText(`Preparando dados...`)

                const input = ss.Buffer.concat(arrayOfChunks);
                let downloadedData = JSON.parse(pako.ungzip(input, { to: "string" }))

                window.setAppLoadingText(`Importando usuários...`)
                await vm.$db.users.bulkPut(downloadedData.users)
                window.setAppLoadingText(`Importando clientes...`)
                await vm.$db.clients.bulkPut(downloadedData.clients)

                window.setAppLoadingText(`Importando pedidos...`)
                await vm.$db.requests.bulkPut(downloadedData.requests)
                await vm.$db.requestClientAddresses.bulkPut(downloadedData.requestClientAddresses)
                await vm.$db.requestClientPhones.bulkPut(downloadedData.requestClientPhones)
                await vm.$db.requestOrders.bulkPut(downloadedData.requestOrders)
                await vm.$db.requestOrderProducts.bulkPut(downloadedData.requestOrderProducts)
                await vm.$db.requestPayments.bulkPut(downloadedData.requestPayments)

                window.setAppLoadingText(`Importando endereços...`)
                await vm.$db.addresses.bulkPut(downloadedData.addresses)
                window.setAppLoadingText(`Importando telefones...`)
                await vm.$db.clientPhones.bulkPut(downloadedData.clientPhones)
                window.setAppLoadingText(`Importando endereços dos clientes...`)
                await vm.$db.clientAddresses.bulkPut(downloadedData.clientAddresses)
                window.setAppLoadingText(`Importando produtos...`)
                await vm.$db.products.bulkPut(downloadedData.products)
                window.setAppLoadingText(`Importando dispositivos...`)
                const devices = await Promise.all(_.map(downloadedData.devices, (device) => {
                    return new Promise(async (resolve) => {
                        const devicePositions = _.map(device.positions,(devicePosition) => {
                            devicePosition.lat = devicePosition.position.coordinates[0]
                            devicePosition.lng = devicePosition.position.coordinates[1]
                            delete devicePosition['position']
                            return devicePosition
                        })
                        if(devicePositions.length) await vm.$db.positions.bulkPut(devicePositions)
                        delete device['positions']
                        resolve(device)
                    })
                }))
                await vm.$db.devices.bulkPut(devices)
                window.setAppLoadingText(`Importando canais de divulgação...`)
                await vm.$db.promotionChannels.bulkPut(downloadedData.promotionChannels)
                window.setAppLoadingText(`Importando grupos de clientes...`)
                await vm.$db.clientGroups.bulkPut(downloadedData.clientGroups)
                window.setAppLoadingText(`Importando campos personalizados...`)
                await vm.$db.customFields.bulkPut(downloadedData.customFields)
                window.setAppLoadingText(`Importando formas de pagamento...`)
                await vm.$db.paymentMethods.bulkPut(downloadedData.paymentMethods)

                console.log("Data imported to indexedDB", downloadedData);

                const processChunkOfClients = (chunkOfClients) => {
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
                const processChunkOfAddresses = (chunkOfAddresses) => {
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

                window.setAppLoadingText(`Carregando pesquisa de clientes...`)

                const clientsCount = await vm.$db.clients.count()
                const clientsDocuments = await new Promise(resolve => {
                    let documents = [];
                    let offset = 0, limit = 100;
                    const processInChunks = async () => {
                        if (offset > clientsCount) return resolve(documents)
                        window.setAppLoadingText(`Carregando clientes: ${Math.round((offset / clientsCount) * 100)}%`)
                        const clients = await vm.$db.clients.offset(offset).limit(limit).toArray()
                        const processedChunkOfClients = await processChunkOfClients(clients)
                        documents = _.concat(documents, processedChunkOfClients)
                        offset += limit
                        return processInChunks()
                    };
                    return processInChunks()
                })

                await vm.$db.searchClients.bulkPut(clientsDocuments);

                // begin addresses import

                window.setAppLoadingText(`Carregando pesquisa de endereços...`)

                const addressesCount = await vm.$db.addresses.count()
                const addressesDocuments = await new Promise(resolve => {
                    let documents = [];
                    let offset = 0, limit = 100;
                    const processInChunks = async () => {
                        if (offset > addressesCount) return resolve(documents)
                        window.setAppLoadingText(`Carregando endereços: ${Math.round((offset / addressesCount) * 100)}%`);
                        const addresses = await vm.$db.addresses.offset(offset).limit(limit).toArray()
                        const processedChunkOfAddresses = await processChunkOfAddresses(addresses)
                        documents = _.concat(documents, processedChunkOfAddresses)
                        offset += limit
                        return processInChunks()
                    }
                    return processInChunks()
                })

                await vm.$db.searchAddresses.bulkPut(addressesDocuments)

                window.setAppLoadingText(`Inicializando sistema...`)

                await vm.beforeSystemInitialization()

                if (window.isAppLoading()) {
                    window.removeAppLoading();
                }
                vm.stopLoading();
                vm.setLastDataSyncedDate(vm.importEventRequestedDate);
                vm.setSystemInitialized(true);
                vm.onSystemInitialized();
            })
        },

        onImportFromLastDataSyncedDate(ev){
            console.log("Data sync import event received", ev)
            const vm = this
            vm.importFileSize = ev.fileSize
            const arrayOfChunks = []

            vm.stream.on("data", (chunk) => {
                vm.currentImportedFileSize += chunk.length
                arrayOfChunks.push(chunk)
                const pct = Math.floor((vm.currentImportedFileSize / vm.importFileSize) * 100)
                window.setAppLoadingText(`Baixando banco de dados (${vm.currentImportedFileSize}/${vm.importFileSize}): ${pct}%`)
            })
            vm.stream.on("end", async () => {
                window.setAppLoadingText(`Preparando dados...`);

                const input = ss.Buffer.concat(arrayOfChunks);
                let downloadedData = JSON.parse(pako.ungzip(input, {
                    to: "string"
                }))

                window.setAppLoadingText(`Importando usuários...`)
                await vm.$db.users.bulkPut(downloadedData.users)
                window.setAppLoadingText(`Importando clientes...`)
                await vm.$db.clients.bulkPut(downloadedData.clients)

                window.setAppLoadingText(`Importando pedidos...`)
                await vm.$db.requests.bulkPut(downloadedData.requests)
                await vm.$db.requestClientAddresses.bulkPut(downloadedData.requestClientAddresses)
                await vm.$db.requestClientPhones.bulkPut(downloadedData.requestClientPhones)
                await vm.$db.requestOrders.bulkPut(downloadedData.requestOrders)
                await vm.$db.requestOrderProducts.bulkPut(downloadedData.requestOrderProducts)
                await vm.$db.requestPayments.bulkPut(downloadedData.requestPayments)

                window.setAppLoadingText(`Importando endereços...`)
                await vm.$db.addresses.bulkPut(downloadedData.addresses)
                window.setAppLoadingText(`Importando telefones...`)
                await vm.$db.clientPhones.bulkPut(downloadedData.clientPhones)
                window.setAppLoadingText(`Importando endereços dos clientes...`)
                await vm.$db.clientAddresses.bulkPut(downloadedData.clientAddresses)
                window.setAppLoadingText(`Importando produtos...`)
                await vm.$db.products.bulkPut(downloadedData.products)
                window.setAppLoadingText(`Importando dispositivos...`)
                const devices = await Promise.all(_.map(downloadedData.devices, (device) => {
                    return new Promise(async (resolve) => {
                        const devicePositions = _.map(device.positions,(devicePosition) => {
                            devicePosition.lat = devicePosition.position.coordinates[0]
                            devicePosition.lng = devicePosition.position.coordinates[1]
                            delete devicePosition['position']
                            return devicePosition
                        })
                        if(devicePositions.length) await vm.$db.positions.bulkPut(devicePositions)
                        delete device['positions']
                        resolve(device)
                    })
                }))
                window.setAppLoadingText(`Importando canais de divulgação...`)
                await vm.$db.promotionChannels.bulkPut(downloadedData.promotionChannels)
                window.setAppLoadingText(`Importando grupos de clientes...`)
                await vm.$db.clientGroups.bulkPut(downloadedData.clientGroups)
                window.setAppLoadingText(`Importando campos personalizados...`)
                await vm.$db.customFields.bulkPut(downloadedData.customFields)
                window.setAppLoadingText(`Importando formas de pagamento...`)
                await vm.$db.paymentMethods.bulkPut(downloadedData.paymentMethods)

                console.log("New data imported to indexedDB", downloadedData)

                const clientsWithChanges = []
                _.forEach(downloadedData.clients, client => { clientsWithChanges.push(client.id) })
                _.forEach(downloadedData.clientPhones, clientPhone => { clientsWithChanges.push(clientPhone.clientId) })
                _.forEach(downloadedData.clientAddresses, clientAddress => { clientsWithChanges.push(clientAddress.clientId) })
                if(clientsWithChanges.length) console.log("Clients with changes", clientsWithChanges)
                const addressesWithChanges = []
                _.forEach(downloadedData.addresses, addresses => { addressesWithChanges.push(addresses.id) })
                if(addressesWithChanges.length) console.log("Addresses with changes", addressesWithChanges)
                const processChunkOfClients = (chunkOfClients) => {
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
                const processChunkOfAddresses = (chunkOfAddresses) => {
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

                window.setAppLoadingText(`Carregando pesquisa de clientes...`)

                const clientsDocuments = await new Promise(resolve => {
                    let resultArray = [];
                    let offset = 0, limit = 100;
                    const processInChunks = async () => {
                        if (offset >= clientsWithChanges.length) return resolve(resultArray)
                        window.setAppLoadingText(`Carregando clientes: ${Math.round((offset / clientsWithChanges.length) * 100)}%`);
                        const clients = await vm.$db.clients.where("id").anyOf(clientsWithChanges).offset(offset).limit(limit).toArray()
                        const processedChunkOfClients = await processChunkOfClients(clients)
                        resultArray = _.concat(resultArray, processedChunkOfClients)
                        offset += limit;
                        return processInChunks();
                    }
                    return processInChunks();
                })
                await vm.$db.searchClients.bulkPut(clientsDocuments)

                window.setAppLoadingText(`Carregando pesquisa de endereços...`)

                const addressesDocuments = await new Promise(async resolve => {
                    let resultArray = [];
                    let offset = 0, limit = 100
                    const processInChunks = async () => {
                        if (offset >= addressesWithChanges.length) {
                            return resolve(resultArray)
                        } else {
                            window.setAppLoadingText(`Carregando endereços: ${Math.round((offset / addressesWithChanges.length) * 100)}%`)
                            const addresses = await vm.$db.addresses.where("id").anyOf(addressesWithChanges).offset(offset).limit(limit).toArray()
                            const processedChunkOfAddresses = await processChunkOfAddresses(addresses)
                            resultArray = _.concat(
                                resultArray,
                                processedChunkOfAddresses
                            )
                            offset += limit
                            return processInChunks()
                        }
                    }
                    return processInChunks()
                })

                await vm.$db.searchAddresses.bulkPut(addressesDocuments)

                if(vm.system.initialized){
                    window.setAppLoadingText(`Verificando novos dados...`)
                }
                else {
                    window.setAppLoadingText(`Inicializando sistema...`)
                }

                await vm.beforeSystemInitialization()

                // initialize
                if (window.isAppLoading()) {
                    window.removeAppLoading()
                }
                vm.stopLoading()
                vm.setLastDataSyncedDate(vm.importEventRequestedDate)
                vm.setSystemInitialized(true)
                vm.onSystemInitialized()
            })
        },

        async beforeSystemInitialization(){
            const vm = this
            // load search
            const taskIds = []
            vm.$db.searchClients.toArray().then(documents => {
                const taskId = `task/${shortid.generate()}`
                taskIds.push(taskId)
                vm.$searchWorker.postMessage({
                    taskId,
                    operation: 'bulkAdd',
                    documents,
                    index: 'clients'
                })
            })
            vm.$db.searchAddresses.toArray().then(documents => {
                const taskId = `task/${shortid.generate()}`
                taskIds.push(taskId)
                vm.$searchWorker.postMessage({
                    taskId,
                    operation: 'bulkAdd',
                    documents,
                    index: 'addresses'
                })
            })

            new Promise((resolve) => {
                vm.$searchWorker.onmessage = (event) => {
                    const taskIndexInArray = _.findIndex(taskIds, (val) => {
                        return val === event.data.taskId
                    })
                    if(taskIndexInArray >= 0){
                        taskIds.splice(taskIndexInArray,1)
                    }
                    if(taskIds.length === 0){
                        resolve()
                    }
                }
            }).then(() => {
                console.log("Search is ready!")
                vm.setIsSearchReady(true)
            })

            /**
             * load vuex orm data
             */
            return Promise.all([
                new Promise((resolve, reject) => {
                    vm.$db.products.toArray().then(products => {
                        vm.$store.dispatch("entities/products/insert", {
                            data: products
                        });
                        resolve();
                    });
                }),
                new Promise((resolve, reject) => {
                    vm.$db.devices.toArray().then(devices => {
                        vm.$store.dispatch("entities/devices/insert", {
                            data: devices
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
            ])

        },

        /**
         * Logout
         */

        async logout() {
            const vm = this;
            const authenticated = await vm.logoutAction()
            if (!authenticated) {
                location.reload()
            }
        }
    },
    mounted(){
        const vm = this;
        vm.importEventOccurred = false
        localStorage.debug = false
        this.initializeSocketIO()
    },
    beforeDestroy(){
        console.log("Removing all listeners")
        this.$socket.removeAllListeners()
        this.$socket.close()
    }
};
