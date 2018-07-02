<template>
    <app-popover v-bind="popoverProps">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="width: 240px;">
                <h3 v-if="showTitle">Status</h3>
                <div v-for="requestStatusItem in requestStatusList" class="item">
                    <div :class="{ active: value === requestStatusItem.value }" style="display: flex; flex-direction: row;">
                        <span style="cursor: pointer;" @click="select(requestStatusItem)">{{ requestStatusItem.name }}</span>
                        <span class="push-both-sides"></span>
                        <icon-check style="height: 11px;"></icon-check>
                    </div>
                </div>
            </div>
        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    export default {
        props: ['value','showTitle','popoverProps'],
        data(){
            return {
            }
        },
        computed: {
            ...mapState('data/request-status', ['requestStatusList']),
        },
        methods: {
            select(requestStatusItem){
                if(requestStatusItem.value !== this.value){
                    this.$emit('change', requestStatusItem.value)
                }
                this.$emit('input', requestStatusItem.value)
            }
        }
    }
</script>

<style scoped>
    h3 {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--d-secondary);
        margin-bottom: 10px;
    }
    .item {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
        margin-bottom: 10px;
    }
    .item:last-child {
        margin-bottom: 0;
    }
    .active >>> .colorizable {
        fill: var(--font-color--primary)
    }
    .active span {
        color: var(--font-color--primary)
    }
    svg >>> .colorizable {
        fill: var(--font-color)
    }
</style>
