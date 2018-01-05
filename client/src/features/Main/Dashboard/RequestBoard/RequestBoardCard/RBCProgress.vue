<template>
    <div>
        <div class="rgbc-progress">
            <div class="tooltip-content">
                <span>Pedido 12548 | 10 min</span>
                <span>Tarefa 12548 | 3 min</span>
                <span>Pendente por Gisele | Base</span>
            </div>
            <div class="tooltip-actions">
                <a>Editar <icon-edit></icon-edit></a>
                <span class="push-both-sides"></span>
                <span>2 minutos</span>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'

    export default {
        props: ['card'],
        data(){
            return {}
        },
        methods: {
        },
    }
</script>

<style scoped>
    .rgbc-progress {
        display: flex;
        flex-direction: column;
    }
    .tooltip-content {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        text-align: left;
        min-width: 260px;
    }
    .tooltip-content span {
        font-size: 12px;
        font-weight: 600;
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
    }
</style>