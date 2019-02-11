<template>
  <div class="Features row">
    <div class="col-md-12" style="position:relative;top:-118px;">
      <img src="../assets/Rectangle 2.png" style="width:100%" />
      <div class="col-md-12" style="position:relative;top:-50px;">
        <ul>
          <li><a href="#">Atendimento</a></li>
          <li><a href="#">Vendas</a></li>
          <li><a href="#">Logística</a></li>
          <li><a href="#">Financeiro</a></li>
          <li><a href="#">Fiscal</a></li>
        </ul>
      </div>
    </div>
    <div style="position:relative;top:-40px;left:240px;">
      <h2 style="font-size:28px;color: #276E73;">
        Recursos que fazem a<br />diferença nos detalhes
      </h2>
    </div>
    <div class="row col-md-12">
      <div class="col-md-6">
        <div>
          <div style="">
            <img src="../assets/icon.png" style="position:relative;top:45px;" />
            <p style="position:relative;left:40px;">Controle em uma tela</p>
          </div>
          <p></p>
        </div>
        <div></div>
      </div>
      <div class="col-md-6">
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Features",
  status: "ready",
  release: "1.0.0",
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.Features {
  max-width: 1245px;
  margin: 0px auto 0px auto;
}
ul {
  background: #31363c;
  padding-left: 200px;
}
li {
  list-style-type: none;
  float: left;
  margin-left: 20px;
}
a {
  padding: 22px 40px 22px 40px;
  color: white;
  border-radius: 5px;
  text-decoration: none;
}
li a:hover {
  background: linear-gradient(216.93deg, #49dfea -10.02%, #0072e4 91.15%);
}
</style>

<docs>
  ```jsx
  <Features />
  ```
</docs>
