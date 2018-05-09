import { mapActions } from 'vuex'

export default {
    methods: {

        ...mapActions('data/client-groups', ['setClientGroups']),
        ...mapActions('data/custom-fields', ['setCustomFields']),
        ...mapActions('data/promotion-channels', ['setPromotionChannels']),
        ...mapActions('data/accounts', ['setAccounts']),
        ...mapActions('data/payment-methods', ['setPaymentMethods']),

        loadRequestDependencyData(data){
            this.setClientGroups(data.clientGroups)
            this.setCustomFields(data.customFields)
            this.setPromotionChannels(data.promotionChannels)
            this.setAccounts(data.accounts)
            this.setPaymentMethods(data.paymentMethods)
        }
    }
}