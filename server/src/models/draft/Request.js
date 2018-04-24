import Draft from './Draft'
import _ from 'lodash'
import shortid from 'shortid'

module.exports = class Request extends Draft {

    constructor(companyId, draftId, createdBy){
        super(companyId, draftId, createdBy)
        this.model = {}
        this.setInitialModel()
    }

    setInitialModel(){
        this.model = {
            form: {
                activeStep: null,
                client: {
                    id: null, // null if creating, update if filled
                    name: null,
                    legalDocument: null,
                    showClientAddressForm: false, // if in the current for state, should it show the respective form?
                    selectedClientAddressId: null,
                    clientAddress: {
                        id: null, // null if creating, update if filled
                        number: null,
                        complement: null,
                        selectedTypeIds: [],
                        typeAdd: {
                            name: null
                        },
                        typeEdit: {
                            id: null,
                            name: null
                        },
                        address: {
                            id: null, // null if creating, update if filled
                            name: null,
                            neighborhood: null,
                            cep: null,
                            city: null,
                            state: null
                        }
                    },
                    selectedClientPhoneId: null,
                    clientPhoneAdd: {
                        name: null,
                        number: null
                    },
                    clientPhoneEdit: {
                        id: null,
                        name: null,
                        number: null
                    },
                    selectedCustomFields: [
                        {
                            id: null, // id of the custom field
                            value: null // value of the custom field
                        }
                    ],
                    customFieldAdd: {
                        name: null
                    },
                    customFieldEdit: {
                        id: null,
                        name: null
                    },
                    selectedClientGroupId: null,
                    clientGroupAdd: {
                        name: null
                    },
                    clientGroupEdit: {
                        id: null,
                        name: null
                    }
                },
                order: {
                    orderProducts: [
                        {
                            id: shortid.generate(), // null if creating, update if filled
                            product: {
                                id: null, // null if creating, update if filled
                                name: null
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
                    {
                        id: shortid.generate(), // if payment in cash
                        selectedPaymentMethodId: null,
                        deadline: null, // current date
                        amount: 0.00
                    },
                    /*{
                        id: 2, // if payment in installments
                        deadline: '', // current date
                        amount: 0.00,
                        nextInstallments: [
                            {
                                deadline: '',
                                amount: 0.00
                            }
                        ]
                    }*/
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
            data: {
                client: {
                    clientAddresses: []
                }
            }
        }
    }

    toObj(){
        return _.assign(this.model, {
            draftId: this.draftId,
            companyId: this.companyId,
            createdBy: this.createdBy,
            type: 'request',
            isSingle: false
        })
    }
}