<template>
    <div v-if="activeRequest" ref="activeRequestCard">
        TEMOS UM ACTIVE
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Scrollbar from 'smooth-scrollbar';
    import _ from 'lodash';

    export default {
        components: {
        },
        data(){
            return {
                scrollbar: null,
            }
        },
        computed: {
            ...mapGetters('request-board', ['activeRequest']),
        },
        methods: {
            ...mapMutations('morph-screen', []),
            ...mapMutations('request-board', []),
        },
        mounted(){

        }
    }
</script>

<style>

</style>