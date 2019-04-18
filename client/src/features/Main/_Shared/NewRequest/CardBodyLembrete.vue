<template>
    <div class="new-request__body">
        <new-caixa-text class="caixa-text" :text="text"/>
        <div class="new-button__lembrete">
        <new-button-lembrete v-for="(tab, index) in tabs" :key="index" :tab="tab"  />   
        </div>
    </div>
</template>

<script>
import ComCaixaText from './ComCaixaText.vue'
import ComButtonLembrete from './CompButtonLembrete.vue'
export default {
components: {
    'new-caixa-text' : ComCaixaText,
    'new-button-lembrete' : ComButtonLembrete,
},
data(){
    return{
        text: 'DIGITE SEU LEMBRETE OU ANOTAÇÃO E ENCAMINHE PARA O RESPONSÁVEL',
        tabs: [
                  {
                   data: 'Até a data:',   
                   text: 'Hoje',
                  },
                  {
                   data: 'Horário:',   
                   text: '00:00',   
                  },
              ],  
    }
}
}
</script>

<style lang="scss">
.new-request__body {
display: flex;
flex-direction: column;
flex-grow: 1;
padding: 20px 20px 0px 20px ;
background: #161A1D;
.caixa-text{
margin-bottom: 10px;
height: 80px;
}
}
.new-button__lembrete{
display: flex;
flex-direction: row;
flex-grow: 1;
margin: 0px -5px;
}
</style>
