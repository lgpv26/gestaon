<template>
    <div class="ag-select-input">
        <div class="input-box">

        </div>
        <div class="input-select-list">
            <slot></slot>
        </div>
        <select class="original-select">
        </select>
    </div>
</template>
<script>
    import _ from 'lodash';
    export default {
        data(){
            return {
            }
        },
        props: {
        },
        computed: {
        },
        methods: {
        }
    }
</script>

<style scoped>
    div.ag-select-input > select.original-select {
        display: none;
    }
</style>
