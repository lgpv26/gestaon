<template>
    <div class="request-chat">
        <h3 style="margin-bottom: 20px;">Chat pedido X</h3>
        <div ref="scrollbar" style="width: 100%">
            <div class="scrollable-content">
                <div class="chat-container" v-if="items.length">
                    <div v-for="item in items" class="message" :class="{'received-message': item.author !== 1, 'sent-message': item.author === 1}">
                        <h3 v-if="item.author !== 1" class="user-name">{{ item.user.name }}</h3>
                        <span v-if="item.type === 'message'">{{ item.data }}</span>
                        <span v-if="item.type === 'alert'">
                            <i class="mi mi-notifications-active"></i>
                        </span>
                        <span class="time">10:25</span>
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
    import { mapGetters, mapState, mapActions } from 'vuex';
    import Scrollbar from 'smooth-scrollbar';
    import _ from 'lodash';
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
                items: [
                    {
                        author: 2,
                        user: {
                            name: "Mailon Ruan"
                        },
                        data: "Oi, como vai você?",
                        type: 'message'
                    },
                    {
                        author: 1,
                        user: {
                            name: "Thiago"
                        },
                        data: "Oi! Vou bem, e vc??",
                        type: 'message'
                    },
                    {
                        author: 1,
                        user: {
                            name: "Thiago"
                        },
                        data: "sound.mp3",
                        type: 'alert'
                    }
                ],
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
                setImmediate(() => {
                    this.scrollbar.update()
                    this.scrollbar.setPosition(0, 9999999)
                })
            },
            sendMessage(){
                this.inputText = this.inputText.trim()
                if(this.inputText && this.inputText.length){
                    this.items.push({
                        author: 1,
                        user: {
                            name: "Thiago"
                        },
                        data: this.inputText,
                        type: 'message'
                    })
                    this.inputText = ''
                    this.updateScrollPosition()
                }
            },
            sendAlert(){
                this.items.push({
                    author: 1,
                    user: {
                        name: "Thiago"
                    },
                    data: "sound.mp3",
                    type: 'alert'
                })
                this.updateScrollPosition()
            }
        },
        mounted(){
            // initialize scrollbars
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
            this.updateScrollPosition()
        },
        beforeDestroy(){
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
