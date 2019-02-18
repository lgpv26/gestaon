<template>
  <div class="top-banner">
    <div class="n1">
      <div v-html="card" class="card"></div>
      <div class="t1">
        <h2>SUA REVENDA DE GLP<br />EM UM NOVO NÍVEL!</h2>
        <p>Sistema de atendimento e logística nos segundos de uma ligação</p>
      </div>
      <div class="b1">
        <button>
          <div class="button h2"><h2>Acesse grátis</h2></div>
          <div class="button p"><p>30 dias, sem compromisso</p></div>
        </button>
      </div>
      <div class="rec"><img src="../assets/Rectangle.png" /></div>
      <div class="loja">
        <img src="../assets/Loja.png" />
        <div class="loja2"><img src="../assets/plantel-gas.png" /></div>
      </div>
      <div class="bg">
        <img src="../assets/bg-banner.png" />
        <div class="bg2" v-html="relogio"></div>
      </div>
      <div class="vec"><img src="../assets/Vector.png" /></div>
      <div class="map">
        <img src="../assets/PINS.png" />
        <div class="map2"><img src="../assets/Caminhao.png" /></div>
      </div>
    </div>
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
      card: req("./" + "card" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
      relogio: req("./" + "relogio" + ".svg").replace(/^<svg /, `<svg style="fill: ${this.fill}" `),
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/dax.css";
.top-banner {
  background: black;
}
.n1 {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  height: 780px;
  background-image: url(../assets/Top-banner.png);
  background-size: 100%;
  background-repeat: no-repeat;
}

.card {
  position: absolute;
  top: 30px;
  left: 200px;
}
.t1 {
  position: absolute;
  top: 220px;
  left: 205px;
}
.t1 h2 {
  margin: 0px;
  font-family: Dax-Bold;
  font-size: 31px;
  color: white;
}
.t1 p {
  margin: 0px;
  font-family: DaxCondensed;
  font-size: 15px;
  color: white;
}
.b1 {
  position: absolute;
  top: 330px;
  left: 200px;
}
.b1 button {
  width: 182px;
  height: 78px;
  background: linear-gradient(217.73deg, #49dfea -10.02%, #0072e4 91.15%);
  border: 0px;
  border-radius: 10px;
}
button h2 {
  margin: 0px;
  font-family: Dax-BoldItalic;
  font-size: 23px;
  color: white;
}
.button p {
  margin: 0px;
  font-family: Dax-Light-Italic;
  font-size: 12px;
  color: white;
}
.rec {
  position: absolute;
  top: 480px;
}
.rec img {
  width: 100%;
}
.loja {
  position: absolute;
  top: 120px;
  left: 700px;
}
.loja2 {
  position: absolute;
  top: 180px;
  left: 170px;
}
.loja img {
  width: 65%;
}
.bg {
  position: absolute;
  top: 16px;
}
.bg2 {
  position: absolute;
  top: 175px;
  left: 660px;
}
.bg img {
  width: 100%;
}
.map {
  position: absolute;
  top: 458px;
  left: 290px;
}
.map img {
  width: 65%;
}
.map2 {
  position: absolute;
  top: 80px;
  left: 560px;
}
.map2 img {
  width: 65%;
}
.vec {
  position: absolute;
  top: 519px;
}
.vec img {
  width: 100%;
}
</style>

<docs>
  ```jsx
  <TopBanner/>
  ```
</docs>
