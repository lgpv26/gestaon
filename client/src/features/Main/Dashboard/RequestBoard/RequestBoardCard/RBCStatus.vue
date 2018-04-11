<template>
    <div class="rbc-status">
        <div class="rbc-status-item" v-for="statusItem in statusList" :class="{active: statusItem.value === value}" @click="onItemClick(statusItem)">
            <span>{{ statusItem.text }}</span>
            <span class="push-both-sides"></span>
            <icon-check v-if="statusItem.value === value"></icon-check>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    export default {
        props: ['cardId','value'],
        data(){
            return {
                statusList: [
                    {
                        value: 'pending',
                        text: 'Pendente'
                    },
                    {
                        value: 'finished',
                        text: 'Finalizado'
                    }
                ],
            }
        },
        methods: {
            onItemClick(statusItem){
                if(statusItem !== this.value){
                    this.changeValue(statusItem)
                }
            },
            changeValue(statusItem){
                const sendData = {
                    cardId: this.cardId,
                    status: statusItem.value
                }
                console.log("Emitting request-board:request-timeline:change-status", sendData)
                this.$socket.emit('request-board:request-timeline:change-status', sendData)
                this.$emit('change', statusItem.value)
                this.$emit('input', statusItem.value)
            }
        },
    }
</script>

<style>
    .rbc-status {
        width: 140px;
    }
    .rbc-status-item {
        display: flex;
        flex-direction: row;
        padding: 5px 8px;
        align-items: center;
        cursor: pointer;
    }
    .rbc-status-item span {
        color: var(--font-color--10);
        text-transform: uppercase;
    }
    .rbc-status-item.active span {
        color: var(--font-color--primary);
        text-transform: uppercase;
    }
    .rbc-status-item.active .colorizable {
        fill: var(--font-color--primary);
    }
</style>