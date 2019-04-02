<template>
     <div class="new-request__body">
               <div class="new-request__caixa">
                   <span class="new-request__span">DIGITE PARA PESQUISAR OU LEMBRAR</span>
                     <new-button-it img="./Elements/Vector.png" NomeButton="Lembrar" />
               </div>
            <div class="new-request__centro">
                <div>
                <img src="./Elements/graf-sale.png">
                </div>
                <span>Pesquise por contatos cadastrados ou inicie <br> outras opções no topo da página</span>
            </div>
            <div class="new-body__img">
                <img src="./Elements/Group 5.png">
            </div>    
       </div>
</template>

<script>
import CompButtonIT from './CompButtonIT.vue'
export default {
    components: {
        'new-button-it' : CompButtonIT,
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
            .new-request__caixa{
                display: flex;
                flex-direction: row;
                background: #23272B;
                border: 2px;
                border-radius: 2px;
                height: 63px;
                padding: 12px;
            }
        
            .new-request__centro{
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 30px 0px 30px 0px;
            }
            .new-request__centro span{
                text-align: center;
                font-family: Halton;
                font-size: 14px;
                margin-top: 10px;
            }
        }
</style>
