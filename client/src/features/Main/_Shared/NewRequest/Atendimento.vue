<template>
    <div>
    <new-TopHeader></new-TopHeader> 
    <div class="new-request__menu">
        <new-button v-for="(tab, index) in tabs" :key="index" :tab="tab" @NomeDoEvento="onTabClick($event)"></new-button>
    </div>
    <new-TopBody v-if="activeTab === 'search'"></new-TopBody>
    <new-TopBodyLembrete  v-if="activeTab === 'note'"></new-TopBodyLembrete>
    <new-TopBodyContato v-if="activeTab === 'contact'"></new-TopBodyContato>
    <div v-if="activeTab === 'order'">Pedido</div>
    <new-TopFooter :activeTab="activeTab"></new-TopFooter>
    </div>
</template>

<script>
import CompButton from './CompButton.vue'
import TopHeader from "./CardHeader.vue"
import TopBodyBusca from "./CardBodyBusca.vue"
import TopBodyLembrete from "./CardBodyLembrete.vue"
import TopBodyContato from "./CardBodyContato.vue"
import TopFooter from "./CardFooter.vue"

export default {
    components: {
    'new-button' : CompButton,
    'new-TopHeader' : TopHeader,
    'new-TopBody' : TopBodyBusca,
    'new-TopBodyLembrete' : TopBodyLembrete,
    'new-TopBodyContato' : TopBodyContato,
    'new-TopFooter' : TopFooter,
    },
    data(){
            return {
                activeTab: 'search',
              tabs: [
                  {
                      name: 'search',
                      titulo: "Busca",
                      text1: 0 + " cadastros",
                      text2: "encontrados",
                      icons: '',
                  },
                  {
                      name: 'note',
                      titulo: "Lembrete",
                      text1: "Crie uma anotação ou ",
                      text2: "salve o texto da busca",
                      icons: '',
                  },
                  {
                      name: 'contact',
                      titulo: "Contato",
                      text1: "Nome e telefone ",
                      text2: "Endereço da entrega",
                      icons: '',
                  },
                  {
                      name: 'order',
                      titulo: "Pedido",
                      text1: 0 + " itens",
                      text2: "R$ " + 0.00,
                      icons: '',
                  },
              ],  
            }
        },
        methods: {
            onTabClick(tabName){
                console.log(tabName)
                this.activeTab = tabName
            }
        }
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