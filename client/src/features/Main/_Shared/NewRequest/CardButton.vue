<template>
    <div class="new-request__menu">
        <new-button v-for="(tab, index) in tabs" :key="index" :tab="tab"></new-button>
    </div>
</template>

<script>
import CompButton from './CompButton.vue'
export default {
    components: {
    'new-button' : CompButton,
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
}
</script>

<style lang="scss" scoped>
    .new-request__menu {
            height: 70px;
            background: #23272B;
            display: flex;
            flex-direction: row;
            align-items: center;
            background: #161A1D;
        }
</style>