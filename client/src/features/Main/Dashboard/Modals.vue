<template>
    <div>
        <modal name="request-chat" :resizable="true" :width="860" :height="520" :minWidth="860" :minHeight="520" classes="app-modal" @before-open="beforeOpenRequestChat">
            <app-request-chat :requestChat="requestChatModal.requestChat"></app-request-chat>
        </modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import _ from 'lodash'
    import RequestChatComponent from "../_Shared/RequestChat/RequestChat.vue"

    export default {
        components: {
            "app-request-chat": RequestChatComponent
        },
        data(){
            return {
                requestChatModal: { requestChat: null }
            }
        },
        computed: {
            ...mapState('auth', [
                'user', 'tokens', 'company'
            ]),
            ...mapState('map', [
                'devices'
            ])
        },
        methods: {
            beforeOpenRequestChat(event){
                if(_.has(event.params, 'requestChat')) this.requestChatModal.requestChat = event.params.requestChat;
            },
        }
    }
</script>

<style>
</style>
