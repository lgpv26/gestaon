<template>
    <div class="new-request__footer">
            <div>
            <img class="new-footer__img"  src="./Elements/ic-down-lixeira.png">
           <img class="new-footer__img" src="./Elements/ic-down-bandeira.png">
           <span class="new-footer__text" >Acimar Rocha</span>
           <img class="new-footer__img" src="./Elements/ic-down-cima.png">
           </div>

           <span style="flex-grow: 1"></span>

            <div v-if="activeTab !== 'search'">
            <img class="new-footer__img" src="./Elements/ic-status.png">
            <span class="new-footer__text" >Posição Pendente</span>
            <img class="new-footer__img" src="./Elements/ic-down-cima.png">
            <new-button-img-text class="backgrand-button" NomeButton='Enviar' />
           </div>
    </div>
</template>

<script>
import CompButtonIT from "./CompButtonIT.vue"
export default {
props:['activeTab'],
components: {
    'new-button-img-text' : CompButtonIT,
}

}
</script>

<style lang="scss">
    .new-request__footer {
            height: 40px;
            background-color: #23272B;
            display: flex;
            flex-direction: row;
            align-items: center;
            flex-shrink: 0;
            .new-footer__img{
            margin: 0px 10px;
            }
            .new-footer__text{
            font-family: Halton;
            font-size: 14px;
            color: #73777B;
            }
        }
        .backgrand-button{
            background: linear-gradient(89.54deg, #0072E4 -0.59%, #25A0A8 100.95%);
            span{
                color: white;
            }
        }
</style>
