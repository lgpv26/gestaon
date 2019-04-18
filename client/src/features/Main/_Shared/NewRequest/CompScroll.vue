<template>
    <div id="scroll">
        <new-endereco-scroll></new-endereco-scroll>   
    </div>
</template>

<script>
import CompEndereçoScroll from "./CompEndereçoScroll.vue"
export default {
components: {
    'new-endereco-scroll' : CompEndereçoScroll
},
}
</script>

<style>
#scroll{
    width: 390px;
    overflow-y: scroll; 
    margin-bottom:20px;
    padding-right: 10px;
    margin-top: -150px;
    height: 235px;
}
#scroll::-webkit-scrollbar { width:10px;background:transparent;} /* configurando scroll */
#scroll::-webkit-scrollbar-track { background:transparent;}
#scroll::-webkit-scrollbar-thumb {background: #373C42;border-radius: 5px; }
</style>
