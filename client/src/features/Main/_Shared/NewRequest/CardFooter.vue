<template>
    <div class="new-request__footer">
            <img class="new-footer__img"  src="./Elements/ic-down-lixeira.png">
           <img class="new-footer__img" src="./Elements/ic-down-bandeira.png">
           <span class="new-footer__text" >Acimar Rocha</span>
           <img class="new-footer__img" src="./Elements/ic-down-cima.png">
           <span style="flex-grow: 1"></span>
       </div>
</template>

<script>
export default {

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
</style>
