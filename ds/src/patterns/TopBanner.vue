<template>
  <div class="Banner row col-md-12">
    <div class="cx-1 col-md-6">
      <div class="v1 start-md"><Icon name="card" size="" /></div>
      <div class="cx-2">
        <h1>sua revenda de GLP em um novo nível!</h1>
        <p>Sistema de atendimento e logística nos segundos de uma ligação</p>
      </div>
      <button>
        <h1>Acesse grátis</h1>
        <p>30 dias sem combrança</p>
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
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.Banner {
  margin: 0px auto 0px auto;
  padding: 0px;
  max-width: 1200px;
}

.v1 {
  margin: 0px;
  padding: 0px 0px 0px 50px;
}
.cx-2 {
  margin: 0px;
  padding: 0px 50px 0px 50px;
}

.cx-2 h1 {
  margin: 0px;
  padding: 0px;
  font-family: Dax-Bold;
  line-height: normal;
  font-size: 38px;
  text-transform: uppercase;
  color: white;
  text-align: left;
}
.cx-2 p {
  margin: 0px;
  padding: 0px;
  font-family: DaxCondensed;
  font-size: 18px;
  color: white;
  text-align: left;
}
.cx-1 button {
  margin: 10px 0px 0px 50px;
  padding: 0px;
  border: 0px;
  border-radius: 10px;
  width: 200px;
  height: 80px;
  float: left;
  background: linear-gradient(217.73deg, #49dfea -10.02%, #be668d -10.02%, #0072e4 91.15%);
}
button h1 {
  margin: 0px;
  padding: 0px;
  color: white;
  font-family: Dax-BoldItalic;
  font-size: 26px;
}
button p {
  margin: 0px;
  padding: 0px;
  font-family: Dax-LightItalic;
  font-size: 14px;
  color: white;
}
.cx-3 {
  margin: 0px;
  padding: 0px;
}
</style>

<docs>
  ```jsx
  <TopBanner />
  ```
</docs>
