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

const ev = {
    success: true,
    evData: {

    }
}