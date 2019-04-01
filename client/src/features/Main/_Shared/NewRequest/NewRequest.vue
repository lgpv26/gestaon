<template>
    <div id="app-new-request">
       <div class="new-request__header">
           <span style="padding: 0 10px;"># 2324</span>
           <span>Maringás celular</span>
           <span style="flex-grow: 1"></span>
           <span><i class="mi mi-chat"></i></span>
           <span><i class="mi mi-list"></i></span>
           <span><i class="mi mi-close"></i></span>
       </div>
       <div class="new-request__menu">
           <tab-button style="padding: 0 10px;" v-for="(tab, index) in tabs" :key="index" :tab="tab"></tab-button>
       </div>
       <div class="new-request__body"></div>
       <div class="new-request__footer"></div>
    </div>
</template>

<script>
    import Vue from "vue"
    import TabButton from "./TabButton.vue"
    
    export default {
        components: {
            'tab-button' : TabButton,
        },
        data(){
            return {

              tabs: [
                  {
                      titulo: "Busca",
                      text1: 0 + " cadastros",
                      text2: "encontrados",
                      icons: '',
                  },
                  {
                      titulo: "Lembrete",
                      text1: "Crie uma anotação ou ",
                      text2: "salve o texto da busca",
                      icons: '',
                  },
                  {
                      titulo: "Contato",
                      text1: "Nome e telefone ",
                      text2: "Endereço da entrega",
                      icons: '',
                  },
                  {
                      titulo: "Pedido",
                      text1: 0 + " itens",
                      text2: "R$ " + 0.00,
                      icons: '',
                  },
              ],  
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
        .new-request__body {
            flex-grow: 1;
        }
        .new-request__footer {
            height: 40px;
        }
    }
</style>
