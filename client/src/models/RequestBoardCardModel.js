export default function(){
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
}