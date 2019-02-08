<template>
  <div class="Process row">
    <div class="col-md-12" style="position:relative;left:0px;top:-10px;">
      <h3
        class="title"
        style="text-align: center;position:relative;top:-130px;font-size:23px;color: #4766D6;"
      >
        Controle online, seguro e rápido dos principais processos
      </h3>
      <h3
        class="title"
        style="text-align: center;position:relative;top:-150px;left:-45px;font-size:23px;color: #4766D6;"
      >
        da sua distribuidora de gás,
        <div style="position:relative;top:-50px;left:780px;background: #4766D6;width:11%;">
          <h3 class="title" style="text-align: center;font-size:23px;color:white;">é possível.</h3>
        </div>
      </h3>
    </div>
    <div class="row center-md" style="width:100%;padding:0px 12% 0px 12%;margin-top:-130px;">
      <div class="col-md-4">
        <img src="../assets/mesa.png" style="width:65%;" />
        <div style="padding:0px 20px 0px 50px;text-align:left;">
          <p class="paragraph" style="font-size:18px;font-style:normal;">
            Do atendimento até a venda, <strong>controle total</strong>
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            Atenda o telefone e experimente procurar pelo cliente cadastrado ou criar um cliente
            novo;
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            visualize o histórico de compras e encaminhe para a entrega sem anotação em papel e
            antes de terminar a ligação;
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <img src="../assets/cidade.png" style="width:65%;" />
        <div style="padding:0px 20px 0px 50px;text-align:left;">
          <p class="paragraph" style="font-size:18px;font-style:normal;">
            <strong>Loística</strong> que engloba estoque e rastreamento
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            O vendedor recebe os pedidos por ordem de prioridade no aplicativo móvel e você
            visualiza o deslocamento no mapa até o endereço do cliente;
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            Realizada a entrega, o estoque em trânsito nos veículos é baixado na hora;
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <img src="../assets/escritorio.png" style="width:65%;" />
        <div style="padding:0px 20px 0px 50px;text-align:left;">
          <p class="paragraph" style="font-size:18px;font-style:normal;">
            acompanhe o fluxo de caixa e dre <strong>financeiro</strong>
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            Atenda o telefone e experimente procurar pelo cliente cadastrado ou criar um cliente
            novo;
          </p>
          <p class="paragraph2" style="font-size:18px;font-style:normal;">
            visualize o histórico de compras e encaminhe para a entrega sem anotação em papel e
            antes de terminar a ligação;
          </p>
        </div>
      </div>
    </div>
    <div style="position: relative;margin: 0px;padding: 0px;top:-100px;">
      <img src="../assets/Vector2.png" style="width:100%;" />
    </div>
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

.title {
  font-family: Montserrat;
  font-weight: normal;
}
.paragraph {
  font-family: Montserrat;
}
.paragraph2 {
  font-family: Montserrat;
  color: #73777b;
}
.Process {
  max-width: 1245px;
  margin: 0px auto 0px auto;
}
</style>

<docs>
  ```jsx
  <Process />
  ```
</docs>
