<template>
    <div id="app-new-request">
       <new-Atendimento />
    </div>
</template>

<script>
    import Vue from "vue"
    import Atendimento from "./Atendimento.vue"
    
    export default {
        components: {
           'new-Atendimento' : Atendimento
        },
        data(){
            return {
        }
        },
        computed: {
        },
        methods: {
        }
    };
</script>

<style lang="scss">
    #app-new-request {
        width: 640px;
        // height: 600px;
        position: absolute;
        z-index: 999999999;
        top: 30px;
        left: 250px;
        background: #990000;
        display: flex;
        flex-direction: column; /* row, column */

        .new-request__header {
            height: 40px;
            background-color: #23272B;
            display: flex;
            flex-direction: row;
            align-items: center;
            /*justify-content: center;  */
        }
        .new-request__menu {
            height: 70px;
            background: #23272B;
            display: flex;
            flex-direction: row;
             align-items: center;
        }
        .new-request__footer {
            height: 40px;
        }
    }
</style>
