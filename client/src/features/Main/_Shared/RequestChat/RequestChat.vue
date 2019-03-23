<template>
    <div class="request-chat">
        <h3 style="margin-bottom: 20px;">Chat do pedido {{ requestChat.requestId }}</h3>
        <div ref="scrollbar" style="width: 100%">
            <div class="scrollable-content">
                <div class="chat-container" v-if="items.length">
                    <div v-for="(item, index) in items" class="message" :key="index" :class="{'received-message': item.user.id !== user.id, 'sent-message': item.user.id === user.id}">
                        <h3 v-if="item.user.id !== user.id" class="user-name">{{ item.user.name }}</h3>
                        <span v-if="item.type === 'message'"><pre>{{ item.data }}</pre></span>
                        <span v-if="item.type === 'alert'">
                            <i class="mi mi-notifications-active"></i>
                        </span>
                        <span class="time">{{ moment(item.dateCreated).format('HH:mm') }}</span>
                    </div>
                </div>
                <div class="chat-container" v-else>
                    <span>Ops... Nenhuma mensagem neste pedido...</span>
                </div>
            </div>
        </div>
        <div class="chat-input-container">
            <input type="text" v-model="inputText" @keyup.enter="sendMessage()" placeholder="Digite uma mensagem..." />
            <a class="btn btn--primary" @click="sendMessage()">Enviar</a>
            <a class="alert" @click="sendAlert()"><i class="mi mi-notifications-active"></i></a>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapState, mapActions } from 'vuex'
    import Scrollbar from 'smooth-scrollbar'
    import _ from 'lodash'
    import moment from 'moment'
    import shortid from 'shortid'
    export default {
        props: {
            value: {
                default: null
            },
            requestChat: {
                default: null
            }
        },
        components: {
        },
        data(){
            return {
                inputText: '',
                items: [],
                scrollbar: null
            }
        },
        computed: {
            ...mapGetters('auth', ['hasPermission']),
            ...mapState('auth', ['user', 'company'])
        },
        methods: {
            ...mapActions('tracker', ['loadDevices']),
            ...mapActions('toast', ['showToast','showError']),
            updateScrollPosition(){
                this.$nextTick(() => {
                    this.scrollbar.update()
                    this.scrollbar.setPosition(0, 9999999)
                })
            },
            sendMessage(){
                this.inputText = this.inputText.trim()
                if(this.inputText && this.inputText.length){
                    const tempId = shortid.generate()
                    this.items.push({
                        tempId,
                        user: {
                            id: this.user.id,
                            name: this.user.name
                        },
                        data: this.inputText,
                        type: 'message',
                        dateCreated: moment()
                    })
                    const emitData = {
                        tempId,
                        requestId: this.requestChat.requestId,
                        cardId: this.requestChat.cardId,
                        type: 'message',
                        data: this.inputText
                    }
                    console.log("Emitting request-chat:itemSend", emitData)
                    this.$socket.emit('request-chat:itemSend', emitData)

                    this.inputText = ''
                    this.updateScrollPosition()
                }
            },
            sendAlert(){
                const tempId = shortid.generate()
                this.items.push({
                    tempId,
                    user: {
                        id: this.user.id,
                        name: this.user.name
                    },
                    data: "sound",
                    type: 'alert',
                    dateCreated: moment()
                })
                const emitData = {
                    tempId,
                    requestId: this.requestChat.requestId,
                    cardId: this.requestChat.cardId,
                    type: 'alert',
                    data: 'sound'
                }
                console.log("Emitting request-chat:itemSend", emitData)
                this.$socket.emit('request-chat:itemSend', emitData)

                this.inputText = ''
                this.updateScrollPosition()
            },
            load(){
                const emitData = {
                    requestId: this.requestChat.requestId,
                    cardId: this.requestChat.cardId
                }
                console.log("Emitting request-chat:load", emitData)
                this.$socket.emit('request-chat:load', emitData)
            }
        },
        mounted(){
            const vm = this
            // initialize scrollbars
            vm.scrollbar = Scrollbar.init(vm.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
            vm.load()
            /*vm.updateScrollPosition()*/
            /*vm.$options.sockets['request-chat:load'] = (ev) => {
                console.log("Received request-chat:load", ev)
                if (ev.success) {
                    vm.items = _.map(_.reverse(ev.evData), (item) => {
                        return item
                    })
                    vm.updateScrollPosition()
                }
            }
            vm.$options.sockets['request-chat:itemSend'] = (ev) => {
                console.log("Received request-chat:itemSend", ev)
                if (ev.success && !_.find(vm.items, { tempId: ev.evData.tempId })) {
                    vm.items.push(ev.evData)
                    vm.updateScrollPosition()
                }
            }*/
        },
        beforeDestroy(){
            const emitData = {
                requestId: this.requestChat.requestId,
                cardId: this.requestChat.cardId
            }
            console.log("Emitting request-chat:leave", emitData)
            this.$socket.emit('request-chat:leave', emitData)
            this.scrollbar.destroy()
        }
    }
</script>

<style lang="scss" scoped>
    h3.form-title {
        color: #999;
    }
    .scrollable-content {

    }
    div.request-chat {
        position: relative;
        flex-grow: 1;
        padding: 20px 5px 20px 20px;
        display: flex;
        flex-direction: column;
    }
    div.chat-container {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        padding-right: 20px;
        flex-shrink: 0;
    }
    div.chat-container .message {
        max-width: 80%;
        padding: 10px 80px 10px 15px;
        margin-bottom: 8px;
        position: relative;
        span pre {
            margin-top: 0;
            margin-bottom: 0;
            white-space: -moz-pre-wrap; /* Mozilla, supported since 1999 */
            white-space: -pre-wrap; /* Opera */
            white-space: -o-pre-wrap; /* Opera */
            white-space: pre-wrap; /* CSS3 - Text module (Candidate Recommendation) http://www.w3.org/TR/css3-text/#white-space */
            word-wrap: break-word;
        }
        .time {
            position: absolute  ;
            right: 7px;
            bottom: 5px;
            font-size: 10px;
            font-weight: bold;
        }
    }
    div.chat-container .message:last-child {
        margin-bottom: 0;
    }
    div.chat-container .received-message {
        align-self: flex-start;
        text-align: left;
        background: rgba(0,0,0,.3);
        h3.user-name {
            margin-bottom: 3px;
            font-size: 10px;
        }
    }
    div.chat-container .sent-message {
        align-self: flex-end;
        text-align: right;
        background: rgba(0,0,0,.1);
        h3.user-name {
            margin-bottom: 3px;
        }
    }
    div.chat-input-container {
        display: flex;
        flex-direction: row;
        margin-top: 20px;
        padding-right: 20px;
        flex-shrink: 0;
        input {
            text-transform: initial;
        }
        a {
            flex-shrink: 0;
            margin-left: 10px;
        }
        a.alert {
            font-size: 20px;
            i {
                color: var(--font-color--secondary);
            }
        }
    }
</style>
