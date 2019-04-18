<template>
    <div :class="['notification', 'is-' + nType]" v-if="show">
        <button class="delete" @click="hide"></button>
        <strong>{{ title }}</strong> {{ text }}
    </div>

</template>
<script>
    import { mapState, mapGetters, mapActions } from 'vuex';

    export default {
        computed: {
            ...mapState('notification', [
                'show', 'type', 'text', 'title'
            ]),
            ...mapGetters('notification', [
                'nType'
            ])
        },
        methods: {
            ...mapActions('notification', [
                'hideNotification'
            ]),
            hide(){
                this.hideNotification();
            }
        }
    }
</script>

<style scoped>
    .notification {
        margin: 5px;
    }
    .notification strong {
        color: white;
    }
    .notification .delete, .notification .delete:hover {
        background-color: transparent
    }
</style>
