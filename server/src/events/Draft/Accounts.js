const Draft = require('.')
const basePath = require('../../middlewares/base-path.middleware')
const _ = require('lodash')
//const RequestPersistance = require('../../modules/Draft/Persistance/RequestPersistance')
//const ClientPersistance = require('../../modules/Draft/Persistance/ClientPersistance')

module.exports = class Accounts extends Draft {

    constructor(server, channels, socket) {
        // extends
        super(server, channels, socket);
        // private
        // this._requestPersistance = new RequestPersistance(server);
        // functions
        this.setAccountsEventListeners();
    }

    /**
     * Accounts Listeners
     *
     */
    setAccountsEventListeners() {

        this.socket.on('draft:accounts-persist', (accountsPersist) => {
            super.resetTimeout()
            super.saveDraft(accountsPersist.draftId).then(() => {
                this.onAccountsPersist(accountsPersist)
            })
        })

        this.socket.on('draft:accounts-recoverance', (accountsRecoverance) => {
            this.onAccountsRecoverance(accountsRecoverance)
        })

        ///////////////////////
        ///     REVENUES    ///
        ///  ** payments    ///
        ///////////////////////

        //
        ///////////////////////
        ///     REVENUES    ///
        ///     ** Groups   ///
        ///////////////////////
        this.socket.on('draft:accounts:revenues:revenue-group-add', (data) => {
            console.log("draft:accounts:revenues:revenue-group-add")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRevenueGroupAdd(data)
            })
        })

        this.socket.on('draft:accounts:revenues:revenue-group-remove', (data) => {
            console.log("draft:accounts:revenues:revenue-group-remove")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRevenueGroupRemove(data)
            })
        })

        ///////////////////////
        ///     REVENUES    ///
        ///     ** items    ///
        ///////////////////////
        this.socket.on('draft:accounts:revenues:revenue-item-add', (data) => {
            console.log("draft:accounts:revenues:revenue-item-add")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRevenueItemAdd(data)
            })
        })

        this.socket.on('draft:accounts:revenues:revenue-item-remove', (data) => {
            console.log("draft:accounts:revenues:revenue-item-remove")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRevenueItemRemove(data)
            })
        })

        // <--- end REVENUES


        ///////////////////////
        ///     EXPENSES    ///
        ///  ** payments    ///
        ///////////////////////

        //
        ///////////////////////
        ///     EXPENSES    ///
        ///     ** Groups   ///
        ///////////////////////
        this.socket.on('draft:accounts:expenses:expense-group-add', (data) => {
            console.log("draft:accounts:expenses:expense-group-add")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseGroupAdd(data)
            })
        })

        this.socket.on('draft:accounts:expenses:expense-group-remove', (data) => {
            console.log("draft:accounts:expenses:expense-group-remove")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseGroupRemove(data)
            })
        })

        ///////////////////////
        ///     EXPENSES    ///
        ///     ** items    ///
        ///////////////////////
        this.socket.on('draft:accounts:expenses:expense-item-add', (data) => {
            console.log("draft:accounts:expenses:expense-item-add")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseItemAdd(data)
            })
        })

        this.socket.on('draft:accounts:expenses:expense-item-remove', (data) => {
            console.log("draft:accounts:expenses:expense-item-remove")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseItemRemove(data)
            })
        })

        this.socket.on('draft:accounts:expenses:expense-item-move-up', (data) => {
            console.log("draft:accounts:expenses:expense-item-move-up")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseItemMoveUp(data)
            })
        })

        this.socket.on('draft:accounts:expenses:expense-item-move-down', (data) => {
            console.log("draft:accounts:expenses:expense-item-move-down")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesExpenseItemMoveDown(data)
            })
        })

        // <--- end  EXPENSES


        ///////////////////////////////////
        ///     TRANSACTION ACCOUNTS    ///
        ///  ** payments                ///
        ///////////////////////////////////
        //
        this.socket.on('draft:transaction-accounts:payment-method-add', (data) => {
            console.log("draft:transaction-accounts:payment-method-add")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onTransactionAccountsPaymentMethodAdd(data)
            })
        })
        //
    }
// <-- end setSocketAccountsListeners


    /**
     * Accounts Persist
     * @desc Send to all sockets in Draft/:id the persist accounts event
     *
     * @param {object} accountsPersist - expected: draftId
     * @return {} @property {Socket}
     */
    onAccountsPersist(accountsPersist) {
        let companyId;
        if(this.socket.user.activeCompanyUserId){
            companyId = parseInt(this.socket.user.activeCompanyUserId);
        }
        else {
            if(this.socket.user.companies.length) companyId = _.first(this.socket.user.companies)
        }
        if(companyId){

        }
    }

    /**
     * Accounts Recoverance
     * @desc Send to all sockets in Draft/:id the recoverance event
     *
     * @param {object} accountsRecoverance - expected: accountsId, companyId
     * @return {object} *Draft @property {Socket}
     */
    onAccountsRecoverance(accountsRecoverance) {

    }

    ///////////////////////
    ///     REVENUES    ///
    ///  ** payments    ///
    ///////////////////////
    //

    ///////////////////////
    ///     REVENUES    ///
    ///     ** Groups   ///
    ///////////////////////
    //
    onAccountsRevenuesRevenueGroupAdd(data) {
        this.controller.addRevenueGroup(data).then((revenueGroupData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesRevenueGroupAdd', revenueGroupData)
        }).catch((err) => {
            console.log(err, 'catch do ADD REVENUE GROUP - QUE É DENTRO DO ON ACCOUNTS REVENUES ADD REVENUE GROUP')
        })
    }

    onAccountsRevenuesRevenueGroupRemove(data) {
        this.controller.removeRevenueGroup(data).then((removeRevenueGroupData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesRevenueGroupRemove', removeRevenueGroupData)
        }).catch((err) => {
            console.log(err, 'catch do REMOVE REVENUE GROUP - QUE É DENTRO DO ON ACCOUNTS REVENUES REMOVE REVENUE GROUP')
        })
    }
    //

    ///////////////////////
    ///     REVENUES    ///
    ///     ** Itens    ///
    ///////////////////////
    //
    onAccountsRevenuesRevenueItemAdd(data) {
        this.controller.addRevenueItem(data).then((revenueItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesRevenueItemAdd', revenueItemData)
        }).catch((err) => {
            console.log(err, 'catch do ADD REVENUE ITEM - QUE É DENTRO DO ON ACCOUNTS REVENUES ADD REVENUE ITEM')
        })
    }

    onAccountsRevenuesRevenueItemRemove(data) {
        this.controller.removeRevenueItem(data).then((removeRevenueItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesRevenueItemRemove', removeRevenueItemData)
        }).catch((err) => {
            console.log(err, 'catch do REMOVE REVENUE ITEM - QUE É DENTRO DO ON ACCOUNTS REVENUES REMOVE REVENUE ITEM')
        })
    }

    onAccountsRevenuesRevenueItemMoveUp(data) {
        data.type = 'revenues'
        data.items = 'revenuesItems'

        data.itemId = data.revenuesItemId
        delete data.revenuesItemId

        this.controller.moveUpItem(data).then((moveUpRevenueItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesExpenseItemMoveUp', moveUpRevenueItemData)
        }).catch((err) => {
            console.log(err, 'catch do MOVE UP EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES MOVE UP EXPENSE ITEM')
        })
    }

    onAccountsRevenuesRevenueItemMoveDown(data) {
        data.type = 'revenues'
        data.items = 'revenuesItems'

        data.itemId = data.revenuesItemId
        delete data.revenuesItemId

        this.controller.moveDownItem(data).then((moveDownRevenueItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesExpenseItemMoveDown', moveDownRevenueItemData)
        }).catch((err) => {
            console.log(err, 'catch do MOVE DOWN EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES MOVE DOWN EXPENSE ITEM')
        })
    }

    //

    // <-- end REVENUES

    ///////////////////////
    ///     EXPENSES    ///
    ///  ** payments    ///
    ///////////////////////
    //

    ///////////////////////
    ///     EXPENSES    ///
    ///     ** Groups   ///
    ///////////////////////
    //
    onAccountsExpensesExpenseGroupAdd(data) {
        this.controller.addExpenseGroup(data).then((expenseGroupData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseGroupAdd', expenseGroupData)
        }).catch((err) => {
            console.log(err, 'catch do ADD EXPENSES GROUP - QUE É DENTRO DO ON ACCOUNTS EXPENSES ADD EXPENSES GROUP')
        })
    }

    onAccountsExpensesExpenseGroupRemove(data) {
        this.controller.removeExpenseGroup(data).then((removeExpenseGroupData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseGroupRemove', removeExpenseGroupData)
        }).catch((err) => {
            console.log(err, 'catch do REMOVE EXPENSE GROUP - QUE É DENTRO DO ON ACCOUNTS EXPENSES REMOVE EXPENSE GROUP')
        })
    }
    //

    ///////////////////////
    ///     EXPENSES    ///
    ///     ** Itens    ///
    ///////////////////////
    //
    onAccountsExpensesExpenseItemAdd(data) {
        this.controller.addExpenseItem(data).then((expenseItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseItemAdd', expenseItemData)
        }).catch((err) => {
            console.log(err, 'catch do ADD EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES ADD EXPENSE ITEM')
        })
    }

    onAccountsExpensesExpenseItemRemove(data) {
        this.controller.removeExpenseItem(data).then((removeExpenseItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseItemRemove', removeExpenseItemData)
        }).catch((err) => {
            console.log(err, 'catch do REMOVE EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES REMOVE EXPENSE ITEM')
        })
    }

    onAccountsExpensesExpenseItemMoveUp(data) {
        data.type = 'expenses'
        data.items = 'expenseItems'

        data.itemId = data.expenseItemId
        delete data.expenseItemId

        this.controller.moveUpItem(data).then((moveUpExpenseItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseItemMoveUp', moveUpExpenseItemData)
        }).catch((err) => {
            console.log(err, 'catch do MOVE UP EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES MOVE UP EXPENSE ITEM')
        })
    }

    onAccountsExpensesExpenseItemMoveDown(data) {
        data.type = 'expenses'
        data.items = 'expenseItems'

        data.itemId = data.expenseItemId
        delete data.expenseItemId

        this.controller.moveDownItem(data).then((moveDownExpenseItemData) => {
            this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesExpenseItemMoveDown', moveDownExpenseItemData)
        }).catch((err) => {
            console.log(err, 'catch do MOVE DOWN EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES MOVE DOWN EXPENSE ITEM')
        })
    }

    //

    // <-- end EXPENSES


}