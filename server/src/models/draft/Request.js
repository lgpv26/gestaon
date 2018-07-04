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
            /*form: {
                activeStep: null,
                client: Request.getClientModel(),
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
                    deliveryDate: '',
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
                    /!*{
                        id: 2, // if payment in installments
                        deadline: '', // current date
                        amount: 0.00,
                        nextInstallments: [
                            {
                                deadline: '',
                                amount: 0.00
                            }
                        ]
                    }*!/
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
                customFields: [],
                clientGroups: [],
                clientAddresses: [],
                clientPhones: [],
                clientCustomFields: []
            }*/
        }
    }

    static getClientFormModel(){
        return {
            id: null, // null if creating, update if filled
            name: null,
            legalDocument: null,
            clientAddress: getClientAddressModel(),
            clientPhone: {
                selected: null,
                add: {
                    name: null,
                    number: null
                },
                edit: {
                    id: null,
                    name: null,
                    number: null
                }
            },
            customField: {
                selected: [
                    {
                        id: null, // id of the custom field
                        value: null // value of the custom field
                    }
                ],
                add: {
                    name: null
                },
                edit: {
                    id: null,
                    name: null
                }
            },
            clientGroup: {
                selected: null,
                add: {
                    name: null
                },
                edit: {
                    id: null,
                    name: null
                }
            }
        }
    }
    
    getClientAddressModel() {
        return {
            selected: null,
            showForm: false,
            form: {
                id: null, // null if creating, update if filled
                number: null,
                complement: null,
                type: {
                    selected: [],
                    add: {
                        name: null
                    },
                    edit: {
                        id: null,
                        name: null
                    }
                },
                address: {
                    id: null, // null if creating, update if filled
                    name: null,
                    neighborhood: null,
                    cep: null,
                    city: null,
                    state: null
                }
            }
        }
    }

    toObj(){
        return _.assign(this.model, {
            draftId: this.draftId,
            companyId: this.companyId,
            createdBy: this.createdBy,
            draft: {},
            type: 'request',
            isSingle: false
        })
    }
}