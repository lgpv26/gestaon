<template>
    <div class="rbc-status">
        <div class="rbc-status-item" v-for="userItem in userList" :class="{active: userItem.value === value}" @click="onItemClick(userItem)">
            <span>{{ userItem.text }}</span>
            <span class="push-both-sides"></span>
            <icon-check v-if="userItem.value === value"></icon-check>
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
                userList: [
                ],
            }
        },
        computed: {
            ...mapState('data/users', ['users']),
        },
        watch: {
            users(){
                this.userList = this.users.map((user) => {
                    return {
                        value: user.id,
                        text: user.name
                    }
                })
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
        width: 180px;
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