<template>
<div class="new-request__body">
    <div class="new-row new-body">
        <div class="new-column new-contato">
        <div>
            <span class="text-span">Contato / Cliente <span style="color: tomato;">*</span></span>
        </div>
        <div style="margin-top: 1px;">
            <span class="text-grand-span">NOME / EMPRESA</span>
        </div>
        </div>

         <div class="new-column new-telefone">
        <div>
            <span class="text-span">Telefone</span>
        </div>
        <div class="new-row" style="margin-top: 1px;">
            <span class="text-grand-span">(99) 99999-9999</span>
            <div>
            <img style="margin: 2px 8px 0px 15px;" src="./Elements/ic-checkmark.png" >
            <img style="cursor: pointer;" src="./Elements/bt-expand.png" >
            </div>
        </div>
        </div>
    </div>
     <div class="new-row new-body__endereço"> 
        <div class="endereço">
            <span>Endereços</span>
        </div>  
        <div class="detalhes">
            <span>Detalhes do contato</span>
        </div>
        </div>

        <div class="new-form">
            <!-- parte 1 -->
            
            <!-- <new-cotato-part1></new-cotato-part1> -->
            <!-- <new-form></new-form> -->
            <!-- <new-addres></new-addres> -->
            <new-card-detalhe></new-card-detalhe>
            <!-- parte 2 -->
           <!-- <new-contato></new-contato> -->
          <!-- <new-contato__button></new-contato__button> -->
        </div>
        <!-- <new-scroll></new-scroll> -->
        
</div>
</template>

<script>
import CompContatoButton from "./CompContatoButton.vue"
import CompScroll from "./CompScroll.vue"
import CompContato from "./CompContato.vue"
import CompContatoPart1 from "./CompContatoPar1.vue"
import CompAddres from "./CompAddres.vue"
import CompContatoForm from "./CompContatoForm.vue"
import CardDetalhe from "./CardDetalhe.vue"
export default {
components: {
    'new-contato__button' : CompContatoButton,
    'new-contato' : CompContato,
    'new-scroll' :CompScroll,
    'new-cotato-part1' : CompContatoPart1,
    'new-addres' : CompAddres,
    'new-form' : CompContatoForm,
    'new-card-detalhe' : CardDetalhe,
},
}
</script>

<style lang="scss" >

.new-request__body {
display: flex;
flex-direction: column;
flex-grow: 1;
padding: 20px 20px 0px 20px ;
background: #161A1D; 
 
}
.new-column{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.new-row{
    display: flex;
    flex-direction: row;
    align-content: center;
}
.new-contato{
    background: #23272B;
    border-radius: 2px;
    margin: 0px 5px 0px 0px;
    padding: 10px;
    height: 53px;
    .text-span{
    font-family: Halton;
    font-size: 14px;
    line-height: 17px;
    color: #73777B;
    }
    .text-grand-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: white;
    }
}
.new-telefone{
    background: #23272B;
    border-radius: 2px;
    margin: 0px 0px 0px 5px;
    padding: 10px;
    height: 53px;
    max-width: 210px;
    flex-shrink: 0;
    .text-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: #73777B;    
    }
    .text-grand-span{
    font-family: Halton;
    font-size: 18px;
    line-height: 17px;
    color: #73777B;
    }
}
.new-body{
    margin: 0px -10px;
}
.new-body__endereço{
    margin: 10px -10px 0px -10px;
}
.endereço{
    padding: 7px 10px 5px 12px;
    background: #23272B;
    border-radius: 2px;
    font-family: Halton;
    font-size: 14px;
    height: 32px;
    cursor: pointer;
}
.detalhes{
    padding: 7px 10px 5px 12px;
    background: #31363C;
    border-radius: 2px;
    font-family: Halton;
    font-size: 14px;
    height: 32px;
    cursor: pointer;
}
.new-form{
    height: auto;
    background: #23272B;
    margin: 0px -10px 50px -10px;
    padding: 10px;
    border-radius: 2px;
}

    span{
    font-family: Halton;
    font-size: 14px;
    line-height: normal;
    color: #73777B;
    }


</style>
