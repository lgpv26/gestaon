<template>
    <div>
        <div class="rbc-client" v-if="hasClient">
            <div class="tooltip-content">
                <span v-if="client">{{client.name}}</span>
                <div v-if="client.clientPhones.length" style="margin-top: 8px;">
                    <div v-for="(clientPhone, index) in client.clientPhones" :key="index">
                        <span v-if="clientPhone.id === selectedClientPhone"><i class="mi mi-done" style="position: relative; top: 3px; font-size: 15px"></i></span>
                        <span>{{ clientPhone.name || 'PADRÃO' }}: {{ utils.formatPhone(clientPhone.number) }}</span>
                    </div>
                </div>
                <div v-else style="margin-top: 8px;">
                    <span>Cliente sem telefone.</span>
                </div>
                <span v-if="client.clientGroupId" style="margin-top: 8px">Grupo: {{ client.clientGroup.name }}</span>
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
    import { mapState, mapActions } from 'vuex'
    import _ from 'lodash'

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
            selectedClientPhone(){
                const selectedClientPhoneId = _.get(this.card, 'request.requestClientPhones[0].clientPhoneId', false)
                if(selectedClientPhoneId){
                    return selectedClientPhoneId
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