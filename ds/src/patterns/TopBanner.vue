<template>
  <div class="Banner row">
    <div class="Reset"><img src="..\assets\Top-banner.png" style="width:100%;margin:0px;" /></div>
    <div class="col-md-6 Reset" style="top:-470px;left:200px;">
      <div v-html="card"></div>
      <h1 class="Reset" style="color:white;font-size:30px;">
        SUA REVENDA DE GLP <br />EM UM NOVO NÍVEL!
      </h1>
      <p class="Reset" style="color:white;font-size:15px;top:5px;">
        Sistema de atendimento e logística nos segundos de uma ligação
      </p>
      <button class="Button Reset">
        <h1 class="Reset" style="color:white;font-size:23px;">Acesse grátis</h1>
        <p class="Reset" style="color:white;font-size:12px;">30 dias sem combrança</p>
      </button>
    </div>
    <div class="col-md-6"></div>
  </div>
</template>

<script>
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

.Banner {
  margin: 0px auto 0px auto;
  padding: 0px;
  max-width: 1245px;
  overflow: hidden;
  height: 760px;
  position: relative;
}
.Reset {
  position: relative;
  margin: 0px;
  padding: 0px;
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
  <TopBanner />
  ```
</docs>
