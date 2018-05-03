<template>
    <app-popover>
        <template slot="triggerer">
            Aqui
        </template>
        <template slot="content">
            <div class="form-row" style="margin-bottom: 15px;">
                <div class="form-column">

                </div>
                <div class="form-column">

                </div>
            </div>
            <a class="btn btn--primary" style="float: right;">Adicionar</a>
        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    export default {
        props: ['data'],
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

<style scoped>

</style>
