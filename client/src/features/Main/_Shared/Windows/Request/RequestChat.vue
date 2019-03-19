<template>
    <div class="request__chat" style="display: flex; flex-direction: column;">
        <app-perfect-scrollbar ref="scrollbar" class="scrollbar" style="flex-grow: 1">
            <div class="header">
                <h3>Chat do pedido {{ request.id }}</h3>
            </div>
            <div class="chat-body">
                <ul style="padding-bottom: 20px">
                    <li v-for="(requestChat, index) in requestChats" :key="requestChat.id"
                        :class="{'their-message': requestChat.userId !== user.id, 'my-message': requestChat.userId === user.id, 'sequence': requestChat.isSequence}">
                        <div v-if="requestChat.userId !== user.id" class="avatar">
                            <app-gravatar v-if="!requestChat.isSequence" style="width: 32px; height: 32px; border-radius: 32px;" :email="getUser(requestChat.userId).email"></app-gravatar>
                        </div>
                        <div v-if="requestChat.userId !== user.id" class="message">
                            <span v-if="!requestChat.isSequence" class="name">{{ _.startCase(_.lowerCase(getUser(requestChat.userId).name)) }}</span>
                            <div class="message-time">
                                <span>{{ requestChat.data }}</span>
                                <span class="time">
                                    {{ moment(requestChat.dateCreated).format("HH:mm")}}
                                    <i class="mi mi-refresh" v-if="requestChat.status === 'pending'"></i>
                                    <i class="mi mi-done-all" v-if="requestChat.status === 'synced'"></i>
                                </span>
                            </div>
                        </div>
                        <div v-if="requestChat.userId === user.id" class="message">
                            <span>{{ requestChat.data }}</span>
                            <span class="time">
                                {{ moment(requestChat.dateCreated).format("HH:mm")}}
                                <i class="mi mi-refresh" v-if="requestChat.status === 'pending'"></i>
                                <i class="mi mi-done-all" v-if="requestChat.status === 'synced'"></i>
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
        </app-perfect-scrollbar>
        <div class="chat-input-box">
            <a class="btn btn--circle" @click="sendAlert()" style="padding: 18px;">
                <i style="position: relative; top: -1px;" class="mi mi-notifications"></i>
            </a>
            <a class="btn btn--circle" @click="getRequestChats()" style="padding: 18px;">
                <i style="position: relative; top: -1px;" class="mi mi-sync"></i>
            </a>
            <textarea-autosize v-model="message" class="input message-input" @keydown.native.prevent.enter="sendMessage(user.id)" :min-height="30" :max-height="350"></textarea-autosize>
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
    import User from '../../../../../vuex/models/User'
    import RequestChat from '../../../../../vuex/models/RequestChat'

    export default {
        props: ['request'],
        components: {
        },
        data(){
            return {
                message: '',
                requestChats: []
            }
        },
        sockets:{
            ['request-chat:send'](ev){
                switch(ev.evData.op){
                    case "send":
                        this.$db.requestChats.where({
                            id: ev.evData.data.tmpId
                        }).first(async (requestChat) => {
                            if(requestChat){
                                // update if existent
                                await this.$db.requestChats.where("id").equals(ev.evData.data.tmpId).delete()
                                await this.$db.requestChats.add({
                                    id: ev.evData.data.id,
                                    userId: ev.evData.data.userId,
                                    requestId: ev.evData.data.requestId,
                                    type: 'message',
                                    data: ev.evData.data.data,
                                    dateUpdated: ev.evData.data.dateUpdated,
                                    dateCreated: ev.evData.data.dateCreated,
                                    dateRemoved: null,
                                    status: 'synced'
                                })
                                this.getRequestChats(false)
                                return
                            }
                            // add if new
                            this.$db.requestChats.add({
                                id: ev.evData.data.id,
                                userId: ev.evData.data.userId,
                                requestId: ev.evData.data.requestId,
                                type: 'message',
                                data: ev.evData.data.data,
                                dateUpdated: ev.evData.data.dateUpdated,
                                dateCreated: ev.evData.data.dateCreated,
                                dateRemoved: null,
                                status: 'synced'
                            }).then(() => {
                                this.getRequestChats()
                            })
                        })
                        break
                }
                console.log(ev)
                this.scrollToBottom()
            }
        },
        computed: {
            ...mapState('auth',['user']),
            requestChatsOrder(){
                return _.sortBy(RequestChat.query().where('requestId',this.request.id).get(), (dateObj) => {
                    return new Date(dateObj.dateCreated);
                })
            }
        },
        methods: {
            ...mapActions('chat-queue',['addToQueue']),
            getUser(userId){
                return User.query().whereId(userId).first()
            },
            async getRequestChats(scrollToBottom = true){
                let requestChats = await this.$db.requestChats.where({
                    requestId: this.request.id
                }).toArray()
                requestChats = _.sortBy(requestChats, (requestChat) => {
                    return new Date(requestChat.dateCreated);
                })
                this.requestChats = Object.freeze(_.map(requestChats,(requestChat, index) => {
                    if(requestChats.length && requestChats[index]){
                        const requestChat = requestChats[index]
                        if(requestChats[index-1]){
                            const previousRequestChat = requestChats[index-1]
                            if(requestChat.userId === previousRequestChat.userId){
                                return _.assign(requestChat,{
                                    isSequence: true
                                })
                            }
                        }
                    }
                    return _.assign(requestChat,{
                        isSequence: false
                    })
                }))
                if(scrollToBottom) this.scrollToBottom()
                return this.requestChats
            },
            sendAlert(){
                const requestChatTmpId = `tmp/${shortid.generate()}`;
                const sendData = {
                    id: requestChatTmpId,
                    userId: this.user.id,
                    requestId: this.request.id,
                    type: 'alert',
                    data: 'sound',
                    dateUpdated: this.moment().toISOString(),
                    dateCreated: this.moment().toISOString(),
                    dateRemoved: null,
                    status: 'pending'
                }
                this.addToQueue({
                    type: "request",
                    op: "chat-send",
                    data: sendData,
                    date: this.moment().toISOString()
                })
                this.$db.requestChats.add(sendData).then(() => {
                    this.getRequestChats()
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
                    dateUpdated: this.moment().toISOString(),
                    dateCreated: this.moment().toISOString(),
                    dateRemoved: null,
                    status: 'pending'
                }

                this.$db.requestChats.add(sendData).then(() => {
                    this.getRequestChats()
                })

                this.addToQueue({
                    type: "request",
                    op: "chat-send",
                    data: sendData,
                    date: this.moment().toISOString()
                })

                this.message = ""
                this.scrollToBottom()
            },
            scrollToBottom(){
                Vue.nextTick(() => {
                    this.$refs.scrollbar.$el.scrollTop += 5000
                    this.$refs.scrollbar.update()
                })
            }
        },
        async mounted(){
            this.requestChats = await this.getRequestChats()
            this.scrollToBottom()
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
            flex-shrink: 0;
            textarea {
                margin: 0 10px 0 10px;
                border-bottom: 0;
                padding: 10px;
                height: 30px;
                background-color: var(--bg-color--7);
                border-radius: 10px;
                text-transform: initial;
                &:hover, &:active, &:focus {
                    background-color: var(--bg-color--8);
                }
            }
        }
    }
</style>
