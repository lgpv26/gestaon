<template>
    <div class="app-connected-users">
        <ul>
            <li v-for="(connectedUser, index) in connectedUsers" :key="index">
                {{ utils.getInitialsFromString(connectedUser.name) }}
            </li>
        </ul>
    </div>
</template>

<script>
    import _ from 'lodash'
    import { mapState, mapActions } from 'vuex'
    export default {
        components: {
        },
        data(){
            return {}
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
        border-top: 1px solid #292929;
        ul {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
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
</style>
