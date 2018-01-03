<template>
    <div class="request-board-card">
        <h3 class="card-title">{{ card.request.client.name }}</h3>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import DraggableComponent from 'vuedraggable';
    import Scrollbar from 'smooth-scrollbar';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    export default {
        props: ['card'],
        data(){
            return {
            }
        },
        computed: {

        },
        methods: {

        }
    }
</script>

<style>
    .request-board-card {
        padding: 10px;
        background: var(--bg-color--9);
        box-shadow: var(--card-shadow);
    }
</style>