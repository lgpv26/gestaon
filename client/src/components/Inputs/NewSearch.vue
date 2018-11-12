<template>
    <div class="app-new-search">
        <app-popover v-bind="popoverProps" :useScroll="true" :contentPadding="false">
            <template slot="triggerer">
                <slot></slot>
            </template>
            <template slot="content">
                <div class="new-search__container">
                    <div class="search-item" v-for="(item, index) in items" :key="index">
                        <slot name="item" :item="item"></slot>
                    </div>
                </div>
            </template>
        </app-popover>
    </div>
</template>
<script>
    import Vue from 'vue'
    import _ from 'lodash'
    import Popper from 'popper.js'
    import MarkJS from 'mark.js'
    import Scrollbar from 'smooth-scrollbar'
    export default {
        props: ['value','popoverProps','items'],
        data(){
            return {
                popperInstance: null,
                isShowing: false,
                closeTimeout: null,
                markJs: null,
                scrollbar: null
            }
        }
    }
</script>

<style lang="scss" scoped>
    .new-search__container {
        width: 480px;
        .search-item {
            padding: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid var(--border-color--1);
            &:last-child {
                border-bottom: 0 none;
            }
        }
    }
</style>