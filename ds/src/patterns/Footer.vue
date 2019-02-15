<template>
  <div class="Footer">
    <div style="position:absolute;top:-120px;">
      <img src="../assets/rodape-Vector.png" style="width:100%;" />
    </div>
    <div style="position:absolute;top:-160px;">
      <img src="../assets/rodape-Vector2.png" style="width:100%;" />
    </div>

    <div class="row" style="position:relative;top:-40px;">
      <div class="col-md-4 cx-1">
        <div class="col-md-12">
          <h3 class= "proposal">PROPOSTA ÚNICA</h3>
          <p>
            Controle o atendimento, vendas e logística <br> em uma tela, nos segundos de uma <br> ligação.
            Anotação em papel nunca mais!
          </p>
        </div>
        <div class="col-md-12">
          <img src="../assets/logo2.png" style="padding-left:150px;" />
          <p>Copyright 2019. Todos os direitos reservados</p>
        </div>
      </div>

      <div class="col-md-4 pc">
        <img src="../assets/pc.png" />
        <div class="b1"><button>Acessar Demonstração</button></div>
      </div>
      <div class="cx-3 row col-md">
        <div class="col-md-5">
          <h3>LINKS RÁPIDOS</h3>
          <ul>
            <li>
              <a><b>Home</b></a>
            </li>
            <li>
              <a><b>Processos</b></a>
            </li>
            <li>
              <a><b>Vantagens</b></a>
            </li>
            <li>
              <a><b>O que estão dizendo?</b></a>
            </li>
            <li>
              <a><b>Dúvidas</b></a>
            </li>
          </ul>
        </div>
        <div class="cx-4 col-md-7">
          <div class="col-md-12">
            <h3>GESTAON NAS REDES SOCIAIS</h3>
            <p>Comente e compartilhe, ajude a fazer mais pessoas felizes!</p>
          </div>
          <div class="col-md-12" style="padding-right:60px;">
            <Icon name="face" size="medium" style="cursor:pointer;" />
            <Icon name="insta" size="medium" style="cursor:pointer;" />
            <Icon name="twitter" size="medium" style="cursor:pointer;" />
            <Icon name="whats" size="medium" style="cursor:pointer;" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Shows how to layout and structure a home page.
 */
export default {
  name: "Footer",
  status: "deprecated",
  release: "1.0.0",
  metaInfo: {
    title: "Rodape",
    htmlAttrs: {
      lang: "en",
    },
  },
  props: {
    /**
     * The html element name used for the component.
     */
    type: {
      type: String,
      default: "div",
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/montserrat.css";
.Footer {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  background: #23272b;
}
.pc img {
  width: 50%;
}
.b1 button {
  width: 160px;
  height: 40px;
  margin: 0px 20px 0px 20px;
  border: 0px;
  border-radius: 5px;
  background: #dc4c30;
  color: #ffffff;
  font-family: Montserrat-Alternates;
  font-size: 12px;
}
.cx-1 {
  position: relative;
  margin: 20px 0px 0px 140px;
}
.cx-1 h3 {
  color: #ffffff;
  font-size: 12px;
  margin: 40px 0px 5px 0px;
}
.cx-1 p {
  color: rgb(218, 214, 214);
  font-size: 12px;
  margin: 0px;
  font-family: Montserrat-Alternates;
}
.cx-1 img {
  width: 25%;
  margin-left: -150px;
  margin-top: 10px;
  margin-bottom: 5px;
}
.pc {
  margin: 0px 0px 0px -45px;
}
.pc img {
  width: 50%;
  margin: 0px;
}
.pc .b1 {
  margin: 0px;
}
.cx-3 {
  margin: 20px 120px 0px -200px;
}
.cx-3 h3 {
  font-size: 12px;
  margin: 40px 0px 0px 0px;
  color: #ffffff;
  font-family: Montserrat;
}
.cx-3 ul {
  margin: 0px;
  padding: 0px;
}
.cx-3 li {
  list-style-type: none;
  margin: 2px 0px 2px 0px;
}
.cx-3 a {
  font-family: Montserrat-Alternates;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
}
.cx-4 p {
  font-size: 14px;
  color: rgb(218, 214, 214);
  font-family: Montserrat-Alternates;
}
.proposal {
  font-family: Montserrat;
  font-size: 10px;
  z-index: 1;
}
</style>

<docs>
  ```jsx
  <Footer />
  ```
</docs>
