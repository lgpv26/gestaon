<template>
  <div class="Advantages row cx-1">
    <div class="col-md-12"><img src="../assets/Vector3.png" style="width:100%;" /></div>
    <div class="col-md-6 cx-2">
      <img src="../assets/site.png" style="width:90%" />
      <div class="cx-3"><img src="../assets/garoto.png" style="width:20%" /></div>
    </div>
    <div class="col-md-6 cx-4">
      <h2 class="f h2-1">
        Pense fora da caixa <strike style="color:grey;">porta</strike> <b>porta</b>
      </h2>
      <img src="../assets/escrita.png" style="width:70%;" />
    </div>
    <div class="col-md-12 cx-5">
      <img src="../assets/Vector4.png" style="width:100%;height:100%;" />
    </div>
    <div class="col-md-12 cx-6">
      <img src="../assets/Vector5.png" style="width:100%;height:100%;" />
    </div>
    <div class="col-md-12 cx-7"><img src="../assets/elipsis.png" style="width:59%;" /></div>
    <div class="row col-md-12 cx-8">
      <div class="col-md-6 cx-9">
        <div>
          <p class="f">Pesquise seus clientes e encontre</p>
          <p class="f2">Não precisa de internet para fazer as buscas</p>
          <div class="img-1"><img src="../assets/Lupa.png" style="width:12%;" /></div>
        </div>
        <div style="position:relative;top:-20px;">
          <p class="f">Visualize vendedor e entrega no mapa</p>
          <p class="f2">Rastreamento totalmente integrado</p>
          <div class="img-1"><img src="../assets/map.png" style="width:12%;" /></div>
        </div>
      </div>
      <div class="col-md-6" style="position:relative;left:-180px;">
        <div>
          <p class="f">O caixa funciona sem burocracia</p>
          <p class="f2">No acerto de contas é fácil acertar</p>
          <div class="img-2"><img src="../assets/surface.png" style="width:12%;" /></div>
        </div>
        <div style="position:relative;top:-20px;">
          <p class="f">O financeiro manda muito bem!</p>
          <p class="f2">Só mostra os relatórios importantes</p>
          <div class="img-2"><img src="../assets/regra.png" style="width:12%;" /></div>
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
@media only screen and (min-width: 360px) {
  .Advantages {
    margin: 0px auto 0px auto;
    overflow: hidden;
    height: 579px;
  }
  .cx-1 {
    position: relative;
    top: -105px;
  }
  .f {
    font-family: Montserrat-Alternates;
    font-size: 11px;
    color: #e7e8e8;
    margin: 0px;
  }

  .f2 {
    font-family: Montserrat-Alternates;
    color: rgb(143, 143, 143);
    font-size: 11px;
    margin: 0px;
  }
  .cx-2 {
    position: relative;
    top: -150px;
    left: 40px;
  }
  .cx-3 {
    position: relative;
    top: -130px;
    left: 160px;
  }
  .cx-4 {
    position: relative;
    top: -85px;
    z-index: 1;
  }
  .h2-1 {
    position: relative;
    font-size: 18px;
    top: -30px;
    left: 40px;
    color: #55595e;
  }
  .cx-5 {
    position: relative;
    top: -520px;
  }
  .cx-6 {
    position: relative;
    top: -922px;
  }
  .cx-7 {
    position: relative;
    top: -1160px;
    left: 170px;
  }

  .cx-8 {
    position: relative;
    top: -1190px;
    left: 320px;
    z-index: 1;
  }
  .cx-9 {
    position: relative;
    left: 0px;
  }
  .img-1 {
    position: relative;
    left: 250px;
    top: -60px;
  }
  .img-2 {
    position: relative;
    left: 200px;
    top: -60px;
  }
}
@media only screen and (min-width: 1025px) {
  .Advantages {
    max-width: 1245px;
    margin: 0px auto 0px auto;
    overflow: hidden;
    height: 740px;
  }

  .f {
    font-family: Montserrat-Alternates;
    font-size: 13px;
    color: #e7e8e8;
    margin: 0px;
  }

  .f2 {
    font-family: Montserrat-Alternates;
    color: rgb(143, 143, 143);
    font-size: 13px;
    margin: 0px;
  }
  .cx-1 {
    position: relative;
    top: -105px;
  }
  .cx-2 {
    position: relative;
    top: -190px;
    left: 40px;
  }
  .cx-3 {
    position: relative;
    top: -160px;
    left: 180px;
  }
  .cx-4 {
    position: relative;
    top: -140px;
    z-index: 1;
  }
  .h2-1 {
    position: relative;
    font-size: 28px;
    top: -30px;
    left: 40px;
    color: #55595e;
  }
  .cx-5 {
    position: relative;
    top: -620px;
  }
  .cx-6 {
    position: relative;
    top: -1118px;
  }
  .cx-7 {
    position: relative;
    top: -1415px;
    left: 210px;
  }
  .cx-8 {
    position: relative;
    top: -1400px;
    left: 320px;
    z-index: 1;
  }
  .cx-9 {
    position: relative;
    left: 0px;
  }
  .img-1 {
    position: relative;
    left: 300px;
    top: -60px;
  }
  .img-2 {
    position: relative;
    left: 250px;
    top: -60px;
  }
}
</style>

<docs>
    ```jsx
    <Advantages />
    ```
</docs>
