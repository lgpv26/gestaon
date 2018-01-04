<template>
    <div class="page--crud">
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    export default {
    }
</script>

<style scoped>
    .page--crud {
        display: flex;
        flex-grow: 1;
        justify-content: center;
    }
    .page--crud > div {
        width: 1200px;
        text-align: center;
        padding-top: 40px;
    }
</style>
