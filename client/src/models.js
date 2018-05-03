export default {
    createRequestBoardSectionModel(){
        return {
            id: null,
            code: null,
            cards: [],
            size: 1,
            position: null,
            updatedAt: null,
            createdAt: null
        }
    },
    createRequestBoardCardModel(){
        return {
            id: null,
            code: null,
            request: {
                requestAddresses: [
                    {
                        type: 'delivery',
                        clientAddress: {
                            address: {
                                name: "RUA 28 DE JUNHO",
                                // ...
                            },
                            number: 22,
                            // ...
                        }
                        // ...
                    },
                    {
                        type: 'bill',
                        clientAddress: {
                            address: {
                                name: "RUA MARCIANO HALCHUK",
                                // ...
                            },
                            number: 420,
                            // ...
                        },
                        // ...
                    }
                ],
                client: {
                    name: null
                    // ...
                },
                order: {
                    // ... << aqui
                },
                task: {
                    text: null,
                    // ...
                }
            },
            requestId: null,
            sectionId: null,
            companyId: null,
            createdBy: null,
            position: null,
            updatedAt: null,
            createdAt: null
            // ...
        }
    },
    createClientCustomFieldModel(){
        return {
            id: null,
            clientId: null,
            value: null,
            customField: this.createCustomFieldModel()
        }
    },
    createCustomFieldModel(){
        return {
            id: null,
            companyId: null,
            name: null,
            dateUpdated: null,
            dateCreated: null,
            dateRemoved: null
        }
    },
    createClientPhoneModel(){
        return {
            id: null,
            name: null,
            number: null
        }
    },
    createClientAddressModel(){
        return {
            id: null,
            name: null,
            number: null,
            complement: null,
            clientAddressTypes: [],
            address: this.createAddressModel()
        }
    },
    createClientModel(){
        return {
            id: null,
            name: null,
            legalDocument: null,
            clientAddresses: [],
            clientPhones: []
        }
    },
    createAddressModel(){
        return {
            id: null,
            neighborhood: null,
            cep: null,
            city: null,
            state: null
        }
    },
    createOrderProductModel(){
        return {
            id: null,
            product: this.createProductModel()
        }
    },
    createProductModel(){
        return {
            companyId: null,
            dateCreated: null,
            dateRemoved: null,
            dateUpdated: null,
            id: null,
            name: null,
            price: null,
            quantity: null,
            status: null
        }
    }
}