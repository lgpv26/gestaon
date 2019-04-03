<template>
    <div class="new-request__body">
        <new-caixa-text class="caixa-text" :text="text"/>
    </div>
</template>

<script>
import ComCaixaText from './ComCaixaText.vue'
export default {
components: {
    'new-caixa-text' : ComCaixaText,
},
data(){
    return{
        text: 'DIGITE SEU LEMBRETE OU ANOTAÇÃO E ENCAMINHE PARA O RESPONSÁVEL',
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
</style>
