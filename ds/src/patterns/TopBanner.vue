<template>
  <div class="Banner row ">
    <div v-html="background" style="position:absolute;"></div>
    <div v-html="caixa" style="position: absolute;top:775px;"></div>
    <div v-html="vetor" style="position: absolute;top:835px;"></div>
    <div v-html="banner" style="position: absolute;top:60px;"></div>
    <div class="col-md-6">
      <div v-html="card" style="position: relative;top:150px;left:250px;"></div>
      <h1 style="position: relative;color:white;top:130px;left:260px;font-size:48px;">
        SUA REVENDA DE GLP<br />
        EM UM NOVO NÍVEL!
      </h1>
      <p style="position: relative;color:white;top:100px;left:260px;font-size:26px;">
        Sistema de atendimento e logística nos segundos de uma ligação
      </p>
      <button
        style="position: relative;top:100px;left:260px;width:280px;border:0px;
        border-radius:10px;height:120px;background: linear-gradient(217.73deg, #49DFEA -10.02%, #0072E4 91.15%);"
      >
        <h1 style="color:white;font-size:36px;margin:0px;">Acesse grátis</h1>
        <p style="color:white;font-size:18px;margin:0px;">30 dias sem combrança</p>
      </button>
    </div>
    <div v-html="loja" style="position: relative;top:150px;left:80px;"></div>
    <div v-html="butijao" style="position: relative;top:520px;left:40px;z-index:1;"></div>
    <div style="position: relative;top:-100px;left:1400px;">
      <img src="..\assets\plantel-gas.png" />
    </div>
    <div style="position: relative;top:140px;left:80px;"><img src="..\assets\PINS.png" /></div>
    <div style="position: relative;top:280px;right:0px;"><img src="..\assets\Group.png" /></div>
  </div>
</template>

<script>
const req = require.context("@/assets/icons/", true, /^\.\/.*\.svg$/)
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "TopBanner",
  status: "ready",
  release: "1.0.0",
  fill: {
    type: String,
    default: "currentColor",
  },
  data() {
    return {
      loja: req("./" + "loja-full" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
      background: req("./" + "particles" + ".svg").replace(
        /^<svg /,
        `<svg style="fill: ${this.fill}" `
      ),
      card: req("./" + "card" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
      vetor: req("./" + "Vector" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
      banner: req("./" + "bg-banner" + ".svg").replace(
        /^<svg /,
        `<svg style="fill: ${this.fill}" `
      ),
      caixa: req("./" + "caixa" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";

.Banner {
  margin: 0px auto 0px auto;
  padding: 0px;
  width: 1920px;
}
</style>

<docs>
  ```jsx
  <TopBanner/>
  ```
</docs>
