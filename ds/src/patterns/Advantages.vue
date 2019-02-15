<template>
  <div class="Advantages row " style="position:relative;top:-105px;">
    <div class="col-md-12" style="position:relative;top:0px;">
      <img src="../assets/Vector3.png" style="width:100%;" />
    </div>
    <div class="col-md-6" style="position:relative;top:-190px;left:40px;">
      <img src="../assets/site.png" style="width:90%" />
      <div style="position:relative;top:-160px;left:180px;">
        <img src="../assets/garoto.png" style="width:20%" />
      </div>
    </div>
    <div class="col-md-6" style="position:relative;top:-140px;z-index:1;">
      <h2 class="f" style="position:relative;font-size:28px;top:-30px;left:40px;color: #55595E;">
        Pense fora da caixa <strike style="color:grey;">porta</strike> <b>porta</b>
      </h2>
      <img src="../assets/escrita.png" style="width:70%;" />
    </div>
    <div class="col-md-12" style="position:relative;top:-620px;">
      <img src="../assets/Vector4.png" style="width:100%;height:100%;" />
    </div>
    <div class="col-md-12" style="position:relative;top:-1118px;">
      <img src="../assets/Vector5.png" style="width:100%;height:100%;" />
    </div>
    <div class="col-md-12" style="position:relative;top:-1415px;left:210px;">
      <img src="../assets/elipsis.png" style="width:59%;" />
    </div>
    <div class="row col-md-12" style="position:relative;top:-1400px;left:320px;z-index:1;">
      <div class="col-md-6" style="position:relative;left:0px;">
        <div>
          <p class= "f">Pesquise seus clientes e encontre</p>
          <p class= "f2">
            Não precisa de internet para fazer as buscas
          </p>
          <div style="position:relative;left:300px;top:-60px;">
            <img src="../assets/Lupa.png" style="width:12%;" />
          </div>
        </div>
        <div style="position:relative;top:-20px;">
          <p class="f" >
            Visualize vendedor e entrega no mapa
          </p>
          <p class= "f2">
            Rastreamento totalmente integrado
          </p>
          <div style="position:relative;left:300px;top:-60px;">
            <img src="../assets/map.png" style="width:12%;" />
          </div>
        </div>
      </div>
      <div class="col-md-6" style="position:relative;left:-180px;">
        <div>
          <p class="f">O caixa funciona sem burocracia</p>
          <p class= "f2">
            No acerto de contas é fácil acertar
          </p>
          <div style="position:relative;left:250px;top:-60px;">
            <img src="../assets/surface.png" style="width:12%;" />
          </div>
        </div>
        <div style="position:relative;top:-20px;">
          <p class="f">O financeiro manda muito bem!</p>
          <p class= "f2">
            Só mostra os relatórios importantes
          </p>
          <div style="position:relative;left:250px;top:-60px;">
            <img src="../assets/regra.png" style="width:12%;" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Advantages",
  status: "ready",
  release: "1.0.0",
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/montserrat.css";
.Advantages {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  overflow: hidden;
  height: 740px;
}

.f{
  font-family: Montserrat-Alternates;
  font-size:13px;
  color: #E7E8E8;
  margin:0px;
}

.f2{
  font-family: Montserrat-Alternates;
  color:rgb(143, 143, 143);
  font-size:13px;
  margin:0px;
}
</style>

<docs>
    ```jsx
    <Advantages />
    ```
</docs>
