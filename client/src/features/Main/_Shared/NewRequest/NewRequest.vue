<template>
    <div id="app-new-request">
       <new-TopHeader></new-TopHeader>
       <new-button></new-button>
       <new-TopBody></new-TopBody>
       <new-TopFooter></new-TopFooter>
    </div>
</template>

<script>
    import Vue from "vue"
    import TopHeader from "./CardHeader.vue"
    import TopButton from "./CardButton.vue"
    import TopBody from "./CardBody.vue"
    import TopFooter from "./CardFooter.vue"
    
    export default {
        components: {
           'new-TopHeader' : TopHeader,
           'new-button' : TopButton,
           'new-TopBody' : TopBody,
           'new-TopFooter' : TopFooter,
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
        height: 600px;
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
