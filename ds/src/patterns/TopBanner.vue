<template>
  <div class="Banner row">
    <div class="Reset"><img src="..\assets\Top-banner.png" style="width:100%;margin:0px;" /></div>
    <div class="col-md-6 Reset" style="top:-470px;left:200px;">
      <div v-html="card"></div>
      <h1 class="Reset" style="color:white;font-size:30px;">
        SUA REVENDA DE GLP <br />EM UM NOVO NÍVEL!
      </h1>
      <p class="Paragraph" style="color:white;font-size:15px;top:5px;">
        Sistema de atendimento e logística nos segundos de uma ligação
      </p>
      <button class="Button Reset">
        <h1 class="Button-I" style="color:white;font-size:23px;">Acesse grátis</h1>
        <p class="Button-II" style="color:white;font-size:12px;">30 dias, sem compromisso</p>
      </button>
    </div>
    <div class="Reset" style="top:-550px;left:100px;">
      <div class="Reset" v-html="relogio" style="top: 230px;left:-45px;z-index:1;"></div>
      <img class="Reset" src="..\assets\Loja.png" style="width:65%;" />
    </div>
    <div class="Reset" style="top:-670px;left:920px;z-index:1;">
      <img class="Reset" src="..\assets\plantel-gas.png" style="width:65%;" />
    </div>
    <div class="Reset" style="top:-645px;">
      <img class="Reset" src="..\assets\Rectangle.png" style="width:100%;" />
    </div>
    <div class="Reset" style="top:-742px;">
      <img class="Reset" src="..\assets\Vector.png" style="width:100%;" />
    </div>
    <div class="Reset" style="top:-1342px;">
      <img class="Reset" src="..\assets\bg-banner.png" style="width:100%;" />
    </div>
    <div class="Reset" style="top:-1670px;left:300px;">
      <img class="Reset" src="..\assets\PINS.png" style="width:65%;" />
    </div>
    <div class="Reset" style="top:-1580px;right:120px;">
      <img class="Reset" src="..\assets\Group.png" style="width:65%;z-index:1;" />
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

.Banner {
  margin: 0px auto 0px auto;
  padding: 0px;
  max-width: 1245px;
  height: 780px;
  overflow: hidden;
  position: relative;
}
.Button-I {
  font-family: Dax-Bold-Italic;
  margin-top: 10px;
}
.Button-II {
  font-family: Dax-Light-Italic;
  margin-top: -15px;
}
.Paragraph {
  font-family: DaxCondensed;
}
.Reset {
  position: relative;
  margin: 0px;
  padding: 0px;
  font-family: Dax-Bold;
}
.Button {
  width: 182px;
  border: 0px;
  border-radius: 10px;
  height: 78px;
  background: linear-gradient(217.73deg, #49dfea -10.02%, #0072e4 91.15%);
  position: relative;
  top: 20px;
}
</style>

<docs>
  ```jsx
  <TopBanner/>
  ```
</docs>
