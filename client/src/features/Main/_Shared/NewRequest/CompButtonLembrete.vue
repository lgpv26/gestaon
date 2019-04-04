<template>
    <div class="button-lembrete">
    <span class="span">{{tab.data}}</span>
    <div style="flex-grow: 1;"></div>
    <span class="span-lembrete">{{tab.text}}</span>
    <img class="new-footer__img" src="./Elements/ic-down.png">
    </div>
</template>

<script>
export default {
props:['tab'],
}
</script>

<style lang="scss">
.button-lembrete{
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    align-items: center;
    height: 32px;
    background: #23272B;
    padding: 0px 0px 0px 10px;
    margin: 0px 5px 117px 5px;
    .new-footer__img{
    margin: 0px 13px;
    }
    .span-lembrete{
    font-family: Halton;
    font-size: 18px;
    color: #E7E8E8;
    }
    .span{
    font-family: Halton;
    font-size: 14px;
    line-height: 17px;
    color: #73777B;
    }
}
</style>
