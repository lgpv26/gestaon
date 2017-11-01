<template>
    <div v-if="hasPermission">
        <slot></slot>
    </div>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        props: {
            permission: {
                default: false
            }
        },
        computed: {
            ...mapState('auth', [
                'user','permissions'
            ])
        },
        data(){
            return {
                hasPermission: false
            }
        },
        watch: {
            permissions(permissions){
                const vm = this;
                console.log(permissions);
                vm.hasPermission = _.some(permissions, (permission) => {
                    return permission === vm.permission;
                });
                console.log(vm.hasPermission);
            }
        }
    }
</script>
<style>
</style>
