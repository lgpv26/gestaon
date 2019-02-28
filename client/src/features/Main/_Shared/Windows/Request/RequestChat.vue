<template>
    <div class="request__chat" style="display: flex; flex-direction: column;">
        <app-perfect-scrollbar class="scrollbar" style="flex-grow: 1">
            <div class="header">
            </div>
            <div class="chat-body">
                <ul>
                    <li v-for="(requestChat, index) in request.requestChats" :key="requestChat.id"
                        :class="{'their-message': requestChat.userId !== user.id, 'my-message': requestChat.userId === user.id, 'sequence': checkSequenceMessage(index)}">
                        <div v-if="requestChat.userId !== user.id" class="avatar">
                            <app-gravatar v-if="!checkSequenceMessage(index)" style="width: 32px; height: 32px; border-radius: 32px;" email="thyoity@gmail.com"></app-gravatar>
                        </div>
                        <div v-if="requestChat.userId !== user.id" class="message">
                            <span v-if="!checkSequenceMessage(index)" class="name">Thiago</span>
                            <div class="message-time">
                                <span>{{ requestChat.data }}</span>
                                <span class="time">{{ moment(requestChat.dateCreated).format("HH:mm")}}</span>
                            </div>
                        </div>
                        <div v-if="requestChat.userId === user.id" class="message">
                            <span>{{ requestChat.data }}</span>
                            <span class="time">{{ moment(requestChat.dateCreated).format("HH:mm")}}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </app-perfect-scrollbar>
        <div class="chat-input-box">
            <a class="btn btn--circle" @click="sendAlert()" style="padding: 18px;">
                <i style="position: relative; top: -1px;" class="mi mi-notifications"></i>
            </a>
            <textarea-autosize v-model="message" class="input message-input" :min-height="30" :max-height="350"></textarea-autosize>
            <a class="btn btn--circle" @click="sendMessage(user.id)" style="padding: 18px;">
                <i class="mi mi-send"></i>
            </a>
            <a class="btn btn--circle" @click="sendMessage(3)" style="padding: 18px; margin-left: 3px;">
                3
            </a>
        </div>
    </div>
</template>

<script>
    import ClientsAPI from '../../../../../api/clients'
    import { mapMutations, mapState, mapActions } from 'vuex'
    import _ from 'lodash'
    import Vue from 'vue'
    import shortid from 'shortid'



    export default {
        props: ['request'],
        components: {
        },
        data(){
            return {
                message: ''
            }
        },
        computed: {
            ...mapState('auth',['user'])
        },
        methods: {
            checkSequenceMessage(index){
                if(this.request.requestChats.length && this.request.requestChats[index]){
                    const requestChat = this.request.requestChats[index]
                    if(this.request.requestChats[index-1]){
                        const previousRequestChat = this.request.requestChats[index-1]
                        if(requestChat.userId === previousRequestChat.userId){
                            return true
                        }
                    }
                }
                return false
            },
            sendAlert(){
                const requestChatTmpId = `tmp/${shortid.generate()}`;
                const sendData = {
                    id: requestChatTmpId,
                    userId: this.user.id,
                    requestId: this.request.id,
                    type: 'alert',
                    data: 'sound',
                    dateCreated: this.moment().toISOString()
                }
                this.$store.dispatch("entities/requestChats/insert", {
                    data: sendData
                })
                this.addToQueue({
                    type: "request",
                    op: "chat-send",
                    data: sendData,
                    date: this.moment().toISOString()
                })
                this.message = ""
            },
            sendMessage(userId){
                const message = this.message.trim()
                if(!message.length){
                    console.log("No message")
                    return
                }
                const requestChatTmpId = `tmp/${shortid.generate()}`;
                const sendData = {
                    id: requestChatTmpId,
                    userId: userId,
                    requestId: this.request.id,
                    type: 'message',
                    data: message,
                    dateCreated: this.moment().toISOString()
                }
                this.$store.dispatch("entities/requestChats/insert", {
                    data: sendData
                })
                this.addToQueue({
                    type: "request",
                    op: "chat-send",
                    data: sendData,
                    date: this.moment().toISOString()
                })
                this.message = ""
            }
        }
    }
</script>

<style lang="scss" scoped>

    .request__chat {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 111;
        background-color: var(--bg-color--2);
        div.header {
            flex-grow: 1;
            padding: 20px 8px;
        }
        a.back {
            z-index: 1;
            position: absolute;
            right: 20px;
            top: 15px;
            i {
                font-size: 48px;
            }
        }
        .chat-body {
            display: flex;
            flex-direction: column;
            .their-message {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 3px;
                padding-left: 20px;
                .avatar {
                    margin-top: 5px;
                }
                .message {
                    display: flex;
                    flex-direction: column;
                    margin: 0 0 ;
                    box-shadow: 1px 1px var(--bg-color--0);
                    .name {
                        color: var(--font-color--primary);
                        font-size: 12px;
                        font-weight: 600;
                        margin-bottom: 3px;
                    }
                    .message-time {
                        display: flex;
                        flex-direction: row;
                        span {
                            color: var(--font-color--7);
                        }
                        .time {
                            color: var(--font-color--4);
                            margin-left: 10px;
                            font-size: 10px;
                            align-self: flex-end;
                            position: relative;
                            right: -3px;
                            bottom: -2px;
                        }
                    }
                }
                .avatar {
                    width: 32px;
                    margin-right: 10px;
                }
            }
            .my-message {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 3px;
                .message {
                    display: flex;
                    flex-direction: row;
                    background-color: var(--bg-color--8);
                    box-shadow: 1px 1px var(--bg-color--0);
                    span {
                        color: var(--font-color--7);
                    }
                    .time {
                        color: var(--font-color--4);
                        margin-left: 10px;
                        font-size: 10px;
                        align-self: flex-end;
                        position: relative;
                        right: -3px;
                        bottom: -2px;
                    }
                }
            }
            .message {
                padding: 5px 8px;
                background-color: var(--bg-color--5);
                margin: 0 20px;
                display: flex;
                flex-direction: column;
            }
        }
        .chat-input-box {
            display: flex;
            flex-direction: row;
            background-color: var(--bg-color--5);
            padding: 10px;
            align-items: center;
            textarea {
                margin: 0 10px 0 10px;
                border-bottom: 0;
                padding: 10px;
                height: 30px;
                background-color: var(--bg-color--7);
                border-radius: 10px;
                &:hover, &:active, &:focus {
                    background-color: var(--bg-color--8);
                }
            }
        }
    }
</style>
