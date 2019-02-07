<template>
    <div class="app-connected-users">
        <ul v-if="connected">
            <li v-for="(connectedUser, index) in connectedUsers" :key="index">
                {{ utils.getInitialsFromString(connectedUser.name) }}
            </li>
        </ul>
        <div v-else class="loader">Loading...</div>
        <div v-if="!connected" style="line-height: 80%; margin: 10px 0 10px">
            <span style="color: var(--font-color--terciary); font-size: 8px; font-weight: bold; text-align: center; ">
                SEM<br/>CONEXÃO
            </span>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import { mapState, mapActions } from 'vuex'
    export default {
        components: {
        },
        data(){
            return {
                connected: false
            }
        },
        watch: {
            ['$socket.connected']: {
                handler(){
                    this.connected = this.$socket.connected
                },
                immediate: true
            }
        },
        sockets: {
            ['presence:add'](ev){
                console.log("Received presence:add", ev)
                if(ev.success){
                    this.addConnectedUser(ev.evData)
                }
            },
            ['presence:remove'](ev){
                console.log("Received presence:remove", ev)
                if(ev.success){
                    this.removeConnectedUser(ev.evData)
                }
            }
        },
        computed: {
            ...mapState('presence', ['connectedUsers'])
        },
        methods: {
            ...mapActions('presence', [
                'removeConnectedUser', 'addConnectedUser'
            ]),
            remove(userId){
                this.connectedUsers = _.filter(this.connectedUsers, (connectedUser) => {
                    return userId !== connectedUser.id
                })
            },
            add(connectedUser){
                this.connectedUsers.push(connectedUser)
            }
        }
    }
</script>
<style scoped lang="scss">
    div.app-connected-users {
        text-align: center;
        ul {
            border-top: 1px solid #292929;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 5px 0 0 0;
            li {
                width: 32px;
                height: 32px;
                border-radius: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--bg-color--7);
                margin-top: 5px;
                &:first-child{
                    margin-top: 10px;
                }
                &:last-child{
                    margin-bottom: 15px;
                }
            }
        }
    }

    .loader,
    .loader:before,
    .loader:after {
        background: var(--terciary-color);
        -webkit-animation: load1 1s infinite ease-in-out;
        animation: load1 1s infinite ease-in-out;
        width: 1em;
        height: 4em;
    }
    .loader {
        color: var(--terciary-color);
        text-indent: -9999em;
        margin: 20px auto 5px auto;
        position: relative;
        font-size: 4px;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation-delay: -0.16s;
        animation-delay: -0.16s;
    }
    .loader:before,
    .loader:after {
        position: absolute;
        top: 0;
        content: '';
    }
    .loader:before {
        left: -1.5em;
        -webkit-animation-delay: -0.32s;
        animation-delay: -0.32s;
    }
    .loader:after {
        left: 1.5em;
    }
    @-webkit-keyframes load1 {
        0%,
        80%,
        100% {
            box-shadow: 0 0;
            height: 4em;
        }
        40% {
            box-shadow: 0 -2em;
            height: 5em;
        }
    }
    @keyframes load1 {
        0%,
        80%,
        100% {
            box-shadow: 0 0;
            height: 4em;
        }
        40% {
            box-shadow: 0 -2em;
            height: 5em;
        }
    }
</style>
