<template>
     <button class="new-request__button">
        <img :src="img"><span class="new-request__span">{{NomeButton}}</span>
    </button>
</template>

<script>
export default {
props:['NomeButton','img',],
data(){
    return{
       
    }
}
}
</script>

<style lang="scss">
.new-request__button{ 
    width: 97px;
    height: 40px;
    margin-left: auto;
    border: 0px;
    background: #373C42;
}
    .new-request__button:hover{
    background: linear-gradient(89.54deg, #0072E4 -0.59%, #25A0A8 100.95%);
    .new-request__span{
        color: white;
    }
}
.new-request__span{
    font-family:Halton ;
    font-style:bold ;
    font-size:14px;
}
.new-request__button img{
    margin: 0px 5px 0px 0px;
}
</style>
