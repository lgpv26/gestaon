<template>
  <div class="row conteiner">
    <div class="cx-1 col-md">
      <div class="col-md-12">
        <h3>PROPOSTA ÚNICA</h3>
        <p>
          Controle o atendimento, vendas e logística em uma tela, nos segundos de uma ligação.
          Anotação em papel nunca mais!
        </p>
      </div>
      <div class="col-md-12">
        <img src="../assets/logo.png" />
        <p>Copyright 2019. Todos os direitos reservados</p>
      </div>
    </div>
    <div class="cx-2 col-md">
      <div class="row center-md col-md-12">
        <h3>Sem riscos, testa agora!<br />“time is money”</h3>
      </div>
      <div class="row center-md col-md-12"><button>Acessar Demostração</button></div>
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
          <h3>GestaON nas redes sociais</h3>
          <p>Comente e compartilhe, ajude a fazer mais pessoas felizes!</p>
        </div>
        <div class="col-md-12">
          <Icon name="face" size="medium" style="cursor:pointer;" />
          <Icon name="insta" size="medium" style="cursor:pointer;" />
          <Icon name="twitter" size="medium" style="cursor:pointer;" />
          <Icon name="whats" size="medium" style="cursor:pointer;" />
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
@import url("https://fonts.googleapis.com/css?family=Montserrat+Alternates");
@import url("https://fonts.googleapis.com/css?family=Montserrat");
.conteiner {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0px 40px 0px 40px;
}
.cx-1 {
  margin: 0px;
  padding: 0px;
  text-align: left;
}
.cx-1 img {
  width: 88px;
  height: 22px;
}
.cx-1 h3 {
  margin: 5px 0px 5px 0px;
  padding: 0px;
  font-size: 15px;
  font-family: Montserrat;
  color: #276e73;
}
.cx-1 p {
  margin: 5px 0px 30px 0px;
  padding: 0px;
  font-size: 14px;
  font-family: Montserrat Alternates;
  color: #276e73;
}
.cx-2 {
  background-image: url("../assets/Object.png");
  background-repeat: no-repeat;
  background-size: 240px;
  background-position: center;
  margin: 0px;
  padding: 0px;
}
.cx-2 h3 {
  font-size: 15px;
  font-family: Montserrat;
  color: #276e73;
  margin-top: 45px;
  margin-bottom: 40px;
  margin-left: 15px;
  text-align: left;
}
.cx-2 button {
  width: 180px;
  height: 40px;
  margin-left: 18px;
  margin-top: 0px;
  border: 0px;
  border-radius: 4px;
  background: #4d76c8;
  color: white;
  cursor: pointer;
}
.cx-3 {
  margin: 0px;
  padding: 0px;
  text-align: left;
}
.cx-3 h3 {
  margin: 5px 0px 5px 0px;
  padding: 0px;
  font-size: 15px;
  font-family: Montserrat;
  color: #276e73;
}
.cx-3 p {
  margin: 5px 0px 20px 0px;
  padding: 0px;
  font-size: 14px;
  font-family: Montserrat Alternates;
  color: #276e73;
}
.cx-3 ul {
  margin: 0px;
  padding: 0px;
}
.cx-3 li {
  list-style-type: none;
  margin: 2px 0px 2px 0px;
}
.cx-3 a:hover {
  color: #58bfc6;
}
.cx-3 a {
  font-family: Montserrat Alternates;
  font-size: 12px;
  color: #276e73;
  cursor: pointer;
}
.cx-4 {
  margin: 0px;
  padding: 0px;
  text-align: right;
}
</style>

<docs>
  ```jsx
  <Footer />
  ```
</docs>
