const request = {
    client: {
        id: '',
        name: '',
        legalDocument: '',
        clientAddresses: [],
        clientPhones: []
    },
    order: {
    },
    task: {
    }
}

module.exports = (server) => { return {
    name: "draft/request/persistence",
    actions: {
        start(){

            // client address

            // client phones

        },
        setClientAddresses(){

        }
        // ...
    }
}}