<template>
    <div>
        <div class="rbc-location" v-if="card.request.requestClientAddresses.length">
            <div class="tooltip-content">
                <span>{{ clientAddress.address.name }}, {{ clientAddress.number }}</span>
                <span>{{ clientAddress.complement }}</span>
                <span>{{ clientAddress.address.neighborhood }} - {{ clientAddress.address.city }}/{{ clientAddress.address.state }}</span>
            </div>
            <div class="tooltip-actions">
                <a href="javascript:void(0)" @click="runRecoverance()">Editar <icon-edit></icon-edit></a>
            </div>
        </div>
        <div class="rbc-location" v-else>
            Sem endereço selecionado...
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import RequestsAPI from '@/api/requests'
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    export default {
        props: ['card'],
        data(){
            return {}
        },
        computed: {
            ...mapState('auth', ['company']),
            clientAddress(){
                if(this.card.request.requestClientAddresses.length){
                    const requestClientAddress = _.first(this.card.request.requestClientAddresses)
                    return requestClientAddress.clientAddress
                }
            }
        },
        methods: {
            runRecoverance(){
                RequestsAPI.recoverance(this.card.request.id, {
                    companyId: this.company.id
                })
            }
        }
    }
</script>

<style scoped>
    .rbc-location {
        display: flex;
        flex-direction: column;
        color: var(--font-color--10)
    }
    .tooltip-content {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        text-align: left;
        min-width: 260px;
    }
    .tooltip-content span {
        font-size: 12px;
        font-weight: 600;
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
        border-bottom: 0;
    }
</style>