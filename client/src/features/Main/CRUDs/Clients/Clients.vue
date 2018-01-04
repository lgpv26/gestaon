<template>
    <app-crud-base-layout>
        <h3>Lista de clientes</h3>
    </app-crud-base-layout>
</template>

<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    import CRUDBaseLayout from '../_Shared/CRUDBaseLayout.vue'

    export default {
        components: {
            'app-crud-base-layout': CRUDBaseLayout
        }
    }
</script>

<style scoped>
    .page--list {
        display: flex;
        flex-grow: 1;
        justify-content: center;
    }
    .page--list > div {
        width: 1200px;
        text-align: center;
        padding-top: 40px;
    }
</style>
