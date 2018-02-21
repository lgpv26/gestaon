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
        this.socket.on('draft:accounts:revenues:add-revenue-group', (data) => {
            console.log("draft:accounts:revenues:add-revenue-group")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesAddRevenueGroup(data)
            })
        })

        this.socket.on('draft:accounts:revenues:remove-revenue-group', (data) => {
            console.log("draft:accounts:revenues:remove-revenue-group")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRemoveRevenueGroup(data)
            })
        })

        ///////////////////////
        ///     REVENUES    ///
        ///     ** items    ///
        /////////////////////// 
        this.socket.on('draft:accounts:revenues:add-revenue-item', (data) => {
            console.log("draft:accounts:revenues:add-revenue-item")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesAddRevenueItem(data)
            })
        })

        this.socket.on('draft:accounts:revenues:remove-revenue-item', (data) => {
            console.log("draft:accounts:revenues:remove-revenue-item")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsRevenuesRemoveRevenueItem(data)
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
        this.socket.on('draft:accounts:expenses:add-expense-group', (data) => {
            console.log("draft:accounts:expenses:add-expense-group")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesAddExpenseGroup(data)
            })
        })

        this.socket.on('draft:accounts:expenses:remove-expense-group', (data) => {
            console.log("draft:accounts:expenses:remove-expense-group")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesRemoveExpenseGroup(data)
            })
        })

        ///////////////////////
        ///     EXPENSES    ///
        ///     ** items    ///
        /////////////////////// 
        this.socket.on('draft:accounts:expenses:add-expenses-item', (data) => {
            console.log("draft:accounts:expenses:add-expense-item")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesAddExpenseItem(data)
            })
        })

        this.socket.on('draft:accounts:expenses:remove-expense-item', (data) => {
            console.log("draft:accounts:expenses:remove-expense-item")
            super.resetTimeout()
            super.saveDraft(data.draftId).then(() => {
                this.onAccountsExpensesRemoveExpenseItem(data)
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
            onAccountsRevenuesAddRevenueGroup(data) {
                this.controller.addRevenueGroup(data).then((revenueGroupData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesAddRevenueGroup', revenueGroupData)
                }).catch((err) => {
                    console.log(err, 'catch do ADD REVENUE GROUP - QUE É DENTRO DO ON ACCOUNTS REVENUES ADD REVENUE GROUP')
                })
            }

            onAccountsRevenuesRemoveRevenueGroup(data) {
                this.controller.removeRevenueGroup(data).then((removeRevenueGroupData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesRemoveRevenueGroup', removeRevenueGroupData)
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
            onAccountsRevenuesAddRevenueItem(data) {
                this.controller.addRevenueItem(data).then((revenueItemData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesAddRevenueItem', revenueItemData)
                }).catch((err) => {
                    console.log(err, 'catch do ADD REVENUE ITEM - QUE É DENTRO DO ON ACCOUNTS REVENUES ADD REVENUE ITEM')
                })
            }

            onAccountsRevenuesRemoveRevenueItem(data) {
                this.controller.removeRevenueItem(data).then((removeRevenueItemData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsRevenuesAddRevenueItem', removeRevenueItemData)
                }).catch((err) => {
                    console.log(err, 'catch do REMOVE REVENUE ITEM - QUE É DENTRO DO ON ACCOUNTS REVENUES REMOVE REVENUE ITEM')
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
            onAccountsExpensesAddExpenseGroup(data) {
                this.controller.addExpenseGroup(data).then((expenseGroupData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesAddExpenseGroup', expenseGroupData)
                }).catch((err) => {
                    console.log(err, 'catch do ADD EXPENSES GROUP - QUE É DENTRO DO ON ACCOUNTS EXPENSES ADD EXPENSES GROUP')
                })
            }

            onAccountsExpensesRemoveExpenseGroup(data) {
                this.controller.removeExpenseGroup(data).then((removeExpenseGroupData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesRemoveExpenseGroup', removeExpenseGroupData)
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
            onAccountsExpensesAddExpenseItem(data) {
                this.controller.addExpenseItem(data).then((expenseItemData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesAddExpenseItem', expenseItemData)
                }).catch((err) => {
                    console.log(err, 'catch do ADD EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES ADD EXPENSE ITEM')
                })
            }

            onAccountsExpensesRemoveExpenseItem(data) {
                this.controller.removeExpenseItem(data).then((removeExpenseItemData) => {
                    this.server.io.in('draft/' + data.draftId).emit('draftAccountsExpensesAddExpenseItem', removeExpenseItemData)
                }).catch((err) => {
                    console.log(err, 'catch do REMOVE EXPENSE ITEM - QUE É DENTRO DO ON ACCOUNTS EXPENSES REMOVE EXPENSE ITEM')
                })
            }

        //

    // <-- end EXPENSES


}