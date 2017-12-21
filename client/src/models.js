export default {
    createRequestBoardSectionModel(){
        return {
            id: null,
            name: null,
            cards: [],
            size: 1
        }
    },
    createRequestBoardCardModel(){
        return {
            id: null,
            request: {
                client: {
                    name: null
                }
            },
            sectionId: null
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
    createAddressModel(){
        return {
            companyId: null,
            id: null,
            name: null,
            neighborhood: null,
            cep: null,
            city: null,
            state: null
        }
    },

    createOrderProductModel(){
        return {
            id: null,
        }
    }
}