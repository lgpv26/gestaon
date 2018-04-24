const accounts = {
    draftId: 'x',
    companyId: 'x',
    createdBy: 'x',
    type: 'accounts',
    isSingle: true,
    state: {
        activeStep: 'accounts',
        form: {
            "revenues": {
                revenueGroups: {
                    "12": { // *revenueGroupId
                        groupNameInput: '',
                        newItemInput: 'Receitas com pro'
                    },
                    "3": { // *revenueGroupId
                        groupNameInput: '',
                        newItemInput: 'Receitas com se'
                    }
                }
            },
            "expenses": {
                expenseGroups: {
                    "2": { // expenseGroupId
                        groupNameInput: '',
                        newItemInput: 'Despesas com pro'
                    },
                    "4": { // expenseGroupId
                        groupNameInput: '',
                        newItemInput: 'Despesas com se'
                    }
                }
            },
            "accounts": {
                accounts: {
                    nameInput: '',
                    balanceInput: ''
                },
                paymentMethods: {
                    nameInput: '',
                    formatInput: '',
                    taxInput: '',
                },
                costCenters: {
                    input: ''
                }
            }
        }
    },
    data: {
        "revenues": {
            "revenueGroups": [
                {},
                {}
            ],
            "revenueItems": [
                {
                },
                {
                }
            ]
        },
        "expenses": {
            "revenueGroups": [
                {},
                {}
            ],
            "revenueItems": [
                {

                },
                {

                }
            ]
        },
        "accounts": {
            "revenueGroups": [
                {},
                {}
            ],
            "revenueItems": [
                {

                },
                {

                }
            ]
        },
    }
}

const request = {
    draftId: 'x',
    companyId: 'x',
    createdBy: 'x',
    type: 'request',
    isSingle: false,
    form: {
        activeStep: 'client',
        client: {
            id: '', // null if creating, update if filled
            name: '',
            legalDocument: '',
            showClientAddressForm: false, // if in the current for state, should it show the respective form?
            selectedClientAddressId: null,
            clientAddress: {
                id: '', // null if creating, update if filled
                number: '',
                complement: '',
                selectedTypeIds: [],
                type: {
                    add: {
                        name: ''
                    },
                    edit: {
                        id: '',
                        name: ''
                    }
                },
                address: {
                    id: '', // null if creating, update if filled
                    name: '',
                    neighborhood: '',
                    cep: '',
                    city: '',
                    state: ''
                }
            },
            selectedClientPhoneId: null,
            clientPhone: {
                add: {
                    name: '',
                    number: ''
                },
                edit: {
                    id: '',
                    name: '',
                    number: ''
                }
            },
            selectedCustomFields: [
                {
                    id: '', // id of the custom field
                    value: '' // value of the custom field
                }
            ],
            customField: {
                add: {
                    name: ''
                },
                edit: {
                    id: '',
                    name: ''
                }
            },
            selectedClientGroupId: null,
            clientGroupAdd: {
                name: ''
            },
            clientGroupEdit: {
                id: '',
                name: ''
            }
        },
        order: {
            orderProducts: [
                {
                    id: '', // null if creating, update if filled
                    product: {
                        id: '', // null if creating, update if filled
                        name: ''
                    },
                    quantity: 1,
                    unitPrice: 0.00,
                    discount: 0.00
                }
            ],
            selectedDivulgationChannelId: null,
            divulgationChannelAdd: {
                name: ''
            },
            divulgationChannelEdit: {
                id: '',
                name: ''
            },
            deliveryDatetime: '',
            responsibleUser: '',
            obs: ''
        },
        task: {
        },
        paymentMethods: [
            { // the id is required, its not possible to create a payment method from a request draft
                id: 1, // if payment in cash
                deadline: '', // current date
                amount: 0.00
            },
            {
                id: 2, // if payment in installments
                deadline: '', // current date
                amount: 0.00,
                nextInstallments: [
                    {
                        deadline: '',
                        amount: 0.00
                    }
                ]
            }
        ],
        selectedAccountId: '',
        accountAdd: {
            name: ''
        },
        accountEdit: {
            id: '',
            name: ''
        },
        selectedStatusId: ''
    },
    data: { // info about data that needs to be edited or created when the persist occurs
        client: {
            id: '', // null if creating, update if filled
            name: '', 
            legalDocument: '',
            // if id + name + legalDocument isEmpty or null = client is null
            clientAddresses: [{
                    id: '', // temp: if creating, update if filled
                    number: '',
                    complement: '',
                    selectedTypeIds: [
                        {
                            id: 'temp:', // temp: if creating, update if filled
                            name: ''  // if update name isn't required
                        }
                    ],
                    address: {
                        id: '', // temp: if creating, update if filled
                        name: '',
                        neighborhood: '',
                        cep: '',
                        city: '',
                        state: ''
                    }
                }
            ],

            clientPhones: [
                {
                    id: '', // temp: if creating, update if filled
                    ddd: '',
                    number: '',
                    name: ''
                }
            ],

            customField: [
                {
                    id: '', // temp: if creating, update if filled
                    name: ''
                }
            ],
            clientCustomFields: [
                {
                    id: '', // id of the custom field, if "temp:" required create a custom field.
                    value: '' // value of the custom field
                }
            ],

            clientGroupId: '', // if "temp:" required create a client group.
            clientGroup: [
                {
                    id: '', // temp: if creating, update if filled
                    name: ''
                }
            ]
        },
        order: {
            orderProducts: [
                {
                    id: '', // temp: if creating, update if filled
                    product: {
                        id: '',  // temp: if creating, update if filled
                        name: '',
                        supplier: { 
                            '': '?'    
                        } // This one I was in doubt.
                    },
                    quantity: '',
                    unitPrice: '',
                    unitDiscount: ''
                }
            ],

            divulgationChannelId: '', // if "temp:" required create a divulgation channel.
            divulgationChannel: [
                {
                    id: '', // temp: if creating, update if filled
                    name: ''
                }
            ],

            deliveryDatetime: '',
            responsibleUser: '',

            obs: ''
        },
        task: {
        },
        paymentMethods: [
            { 
                id: '', // if payment in cash
                deadline: '', // current date
                amount: 0.00
            },
            {
                id: '', // if payment in installments
                deadline: '', // current date
                amount: 0.00,
                nextInstallments: [
                    {
                        deadline: '',
                        amount: 0.00
                    }
                ]
            }
        ],
        accountId: '', // if "temp:" required create a account.
        account: {
            id: '',  // temp: if creating, update if filled
            name: ''
        }
    }
}

const ev = {
    success: true,
    evData: {

    }
}