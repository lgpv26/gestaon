export default {
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
    }
}