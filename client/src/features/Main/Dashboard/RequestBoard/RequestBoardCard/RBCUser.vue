<template>
    <div class="rbc-status">
        <div class="rbc-status-item" v-for="(userItem, index) in userList" :key="index" :class="{active: userItem.value === value}" @click="onItemClick(userItem)">
            <span>{{ userItem.text }}</span>
            <span class="push-both-sides"></span>
            <icon-check v-if="userItem.value === value"></icon-check>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

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
            users: {
                handler(){
                    this.userList = this.users.map((user) => {
                        return {
                            value: user.id,
                            text: user.name
                        }
                    })
                },
                immediate: true
            }
        },
        methods: {
            onItemClick(userItem){
                if(userItem.value !== this.value){
                    this.changeValue(userItem)
                }
            },
            changeValue(userItem){
                const sendData = {
                    cardId: this.cardId,
                    userId: userItem.value
                }
                console.log("Emitting request-board:request-timeline:change-user", sendData)
                this.$socket.emit('request-board:request-timeline:change-user', sendData)
                this.$emit('change', userItem.value)
                this.$emit('input', userItem.value)
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