<template>
    <div>
        <div class="rbc-client" v-if="hasClient">
            <div class="tooltip-content">
                <span v-for="clientPhone in client.clientPhones">{{ clientPhone.name }}: {{ utils.formatPhone(clientPhone.number) }}</span>
                <span v-if="client.clientGroupId">Grupo: {{ client.clientGroup.name }}</span>
            </div>
            <div class="tooltip-actions">
                <a href="javascript:void(0)" @click="runRequestRecoverance({ requestId: card.request.id, companyId: company.id })">Editar <icon-edit></icon-edit></a>
            </div>
        </div>
        <div class="rbc-client" v-else>
            Venda sem cliente...
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import RequestsAPI from '@/api/requests'
    import Vue from 'vue'
    import _ from 'lodash'
    import utils from '@/utils'

    export default {
        props: ['card'],
        data(){
            return {}
        },
        computed:{
            ...mapState('auth', ['company']),
            hasClient(){
                const client = _.get(this.card, 'request.client.id', false)
                if(client){
                    return client
                }
                return false
            },
            client(){
                return this.card.request.client
            }
        },
        methods: {
            ...mapActions('draft/request',['runRequestRecoverance'])
        },
    }
</script>

<style>
    .rbc-client {
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
        color: var(--font-color--8)
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
        border-bottom: 0;
        color: var(--font-color--10);
    }
</style>