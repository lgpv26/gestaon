<template>
  <div class="Process row">
    <div class="col-md-12 cx-1">
      <h3 class="title h3-1">Controle online, seguro e rápido dos principais processos</h3>
      <h3 class="title h3-2">
        da sua distribuidora de gás,
        <div class="cx-2"><h3 class="title h3-3">é possível.</h3></div>
      </h3>
    </div>
    <div class="row center-md h3-4">
      <div class="col-md-4">
        <img src="../assets/mesa.png" style="width:65%;" />
        <div class="cx-3">
          <p class="paragraph">Do atendimento até a venda, <strong>controle total</strong></p>
          <p class="paragraph2">
            Atenda o telefone e experimente procurar pelo cliente cadastrado ou criar um cliente
            novo;
          </p>
          <p class="paragraph2">
            visualize o histórico de compras e encaminhe para a entrega sem anotação em papel e
            antes de terminar a ligação;
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <img src="../assets/cidade.png" style="width:65%;" />
        <div class="cx-3">
          <p class="paragraph"><strong>Logística</strong> que engloba estoque e rastreamento</p>
          <p class="paragraph2">
            O vendedor recebe os pedidos por ordem de prioridade no aplicativo móvel e você
            visualiza o deslocamento no mapa até o endereço do cliente;
          </p>
          <p class="paragraph2">
            Realizada a entrega, o estoque em trânsito nos veículos é baixado na hora;
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <img src="../assets/escritorio.png" style="width:65%;" />
        <div class="cx-3">
          <p class="paragraph">acompanhe o fluxo de caixa e dre <strong>financeiro</strong></p>
          <p class="paragraph2">
            Atenda o telefone e experimente procurar pelo cliente cadastrado ou criar um cliente
            novo;
          </p>
          <p class="paragraph2">
            Visualize o histórico de compras e encaminhe para a entrega sem anotação em papel e
            antes de terminar a ligação;
          </p>
        </div>
      </div>
    </div>
    <div class="cx-4"><img src="../assets/Vector2.png" style="width:100%;" /></div>
  </div>
</template>

<script>
export default {
  name: "Process",
  status: "ready",
  release: "1.0.0",
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/montserrat.css";
@media only screen and (min-width: 360px) {
  .title {
    font-family: Montserrat-Alternates;
    font-weight: normal;
  }
  .paragraph {
    font-family: Montserrat-Alternates;
    font-size: 14px;
    font-style: normal;
  }
  .paragraph2 {
    font-family: Montserrat-Alternates;
    color: #73777b;
    font-size: 14px;
    font-style: normal;
  }
  .Process {
    max-width: 1245px;
    margin: 0px auto 0px auto;
  }
  .cx-1 {
    position: relative;
    left: 0px;
    top: 10px;
  }
  .h3-1 {
    text-align: center;
    position: relative;
    top: -130px;
    font-size: 18px;
    color: #4766d6;
  }
  .h3-2 {
    text-align: center;
    position: relative;
    top: -150px;
    left: -45px;
    font-size: 18px;
    color: #4766d6;
  }
  .cx-2 {
    position: relative;
    top: -38px;
    left: 625px;
    background: #4766d6;
    width: 10%;
  }
  .h3-3 {
    text-align: center;
    font-size: 18px;
    color: white;
  }
  .h3-4 {
    width: 100%;
    padding: 0px 12% 0px 12%;
    margin-top: -130px;
  }
  .cx-3 {
    padding: 0px 20px 0px 50px;
    text-align: left;
  }
  .cx-4 {
    position: relative;
    margin: 0px;
    padding: 0px;
    top: -100px;
  }
}
@media only screen and (min-width: 1025px) {
  .title {
    font-family: Montserrat-Alternates;
    font-weight: normal;
  }
  .paragraph {
    font-family: Montserrat-Alternates;
    font-size: 18px;
    font-style: normal;
  }
  .paragraph2 {
    font-family: Montserrat-Alternates;
    color: #73777b;
    font-size: 18px;
    font-style: normal;
  }
  .Process {
    max-width: 1245px;
    margin: 0px auto 0px auto;
  }
  .cx-1 {
    position: relative;
    left: 0px;
    top: -10px;
  }
  .h3-1 {
    text-align: center;
    position: relative;
    top: -130px;
    font-size: 23px;
    color: #4766d6;
  }
  .h3-2 {
    text-align: center;
    position: relative;
    top: -150px;
    left: -45px;
    font-size: 23px;
    color: #4766d6;
  }
  .cx-2 {
    position: relative;
    top: -50px;
    left: 780px;
    background: #4766d6;
    width: 11%;
  }
  .h3-3 {
    text-align: center;
    font-size: 23px;
    color: white;
  }
  .h3-4 {
    width: 100%;
    padding: 0px 12% 0px 12%;
    margin-top: -130px;
  }
  .cx-3 {
    padding: 0px 20px 0px 50px;
    text-align: left;
  }
  .cx-4 {
    position: relative;
    margin: 0px;
    padding: 0px;
    top: -100px;
  }
}
</style>

<docs>
  ```jsx
  <Process />
  ```
</docs>
