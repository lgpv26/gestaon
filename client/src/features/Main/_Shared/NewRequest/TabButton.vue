<template>
     <div class="new-button"><span class="titulo">{{ tab.titulo }}</span><div class="new-icon" v-html="icons"></div>
                <div class="new-sub-button">
                    <span class="text">{{ tab.text1 }}</span>
                </div>
                <div class="new-sub-button">
                    <span class="text">{{ tab.text2 }}</span>
                </div>
           </div>
</template>

<script>
 const req = require.context("./icons/", true, /^\.\/.*\.svg$/);

export default {
 props:['tab','icons'],
 data(){
  return{
    icons:req( "ic-tab-contact" + '.svg', true, /^\.\/.*\.svg$/),
  }
 }
}
</script>

<style lang="scss" scoped>
    .new-button{
        position: relative;
        display: flex;
        flex-direction: column;
        .new-icon{
        position: absolute;
        top: 0px;
        right: 0px;
        }
        .titulo{
          font-family: Halton;
          font-size: 18px;
          color: #73777B;
          margin-bottom: 3px;
        }
        .text{
          font-family: Halton;
          font-size: 12px;
          color: #73777B;
        }
    }
    .new-sub-button{
        display: flex;
        flex-direction: column;
    }
</style>