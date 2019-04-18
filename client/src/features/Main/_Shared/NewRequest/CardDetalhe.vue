<template>
    <div>
        <div style="margin:0px 0px 15px 0px;" class="new-style">
        <input type="text" class="new-style-01" style="margin:0px 0px 0px 0px;">    
        </div>
        <div style="margin:20px 0px 0px 0px;" class="new-style">
        <input type="text" class="new-style-01">
        <input type="text" class="new-style-02">
        </div>
        <div class="new-style">
        <new-detalhe text="INSCRIÇÃO:" class="new-style-01 none"></new-detalhe>    
        <new-detalhe text="CPF:" class="new-style-02 none"></new-detalhe>
        </div>
        <div class="new-style">
        <new-detalhe text="Vendedor:" option="Selecionar" class="new-style-01"></new-detalhe>    
        <new-detalhe text="Grupo Cliente:" option="Selecionar" class="new-style-02"></new-detalhe>
        </div>
        <div class="new-style"> 
        <new-detalhe text="Prazo:" option="Padrão" class="new-style-01"></new-detalhe>
         <new-detalhe text="Desconto: " option="R$ 5,00 ou 10%" class="new-style-02 none"></new-detalhe>     
        </div>
        <div class="new-style">
        <new-detalhe text="F. pagamento:" option="Boleto" class="new-style-01"></new-detalhe>  
        <new-detalhe text="Email: " option="email@email.com" class="new-style-02 none"></new-detalhe> 
        </div>
    </div> 
</template>

<script>
import CompDetalhe from "./CompDetalhe.vue"
export default {
components: {
    'new-detalhe' : CompDetalhe,
}
}
</script>

<style lang="scss">
.new-style-01{
flex-grow: 1;
margin: 0px 5px 0px 0px;
height: 32px;
max-width: 295px;
}
.new-style-02{
flex-grow: 1;
margin: 0px 0px 0px 5px;
height: 32px;
max-width: 295px;
}
.new-style{
display:flex;
flex-direction:row;
margin:10px 0px 0px 0px;
}
.none{
    .new-box:after{
        display: none;
    }
}

</style>
