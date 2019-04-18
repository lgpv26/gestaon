<template>
  <div class="conteiner row">
    <div class=" row center-md center-sm center-xs">
      <h2 class="cx-1 col-md-12 col-sm-12 col-xs-12">Nossos Planos</h2>
      <h3 class="cx-2 col-md-8 col-sm-8 col-xs-8">
        We believe we have created the most efficient SaaS landing page for your users Landing page
        with features that will convince you to use it for your SaaS business
      </h3>
    </div>
    <div class="liga-desliga row center-md col-md-12 center-sm col-sm-12 col-xs-12">
      <input type="checkbox" class="liga-desliga__checkbox" id="liga-desliga" />
      <label for="liga-desliga" class="liga-desliga__botao"></label>
    </div>
    <div class="bloco row col-md-12 col-sm-12 col-xs-12">
      <div class="cx-4 col-md col-sm col-xs-12">
        <div class="row center-md center-sm center-xs">
          <a href="#">
            <h2 class="Heading1"><b>ESSENCIAL</b></h2>
          </a>
        </div>
        <div class="precos center-md center-sm center-xs" v-if="type === 'monthly'">
          <img class="img1" src="../assets/Group.png" />
        </div>
        <div class="precos center-md center-sm center-xs" v-else>anual</div>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2" style="text-decoration: line-through;">SaaS landing page</h3>
        <h3 class="Paragraph2" style="text-decoration: line-through;">SaaS landing page</h3>
        <h3 class="Paragraph2" style="text-decoration: line-through;">SaaS landing page</h3>
        <div class="row center-md center-sm center-xs"><button class="bt b1">Assinar</button></div>
      </div>
      <div class="cx-4 col-md col-sm col-xs-12">
        <div class="row center-md center-sm center-xs">
          <a href="#">
            <h2 class="Heading1"><b>PROFESSIONAL</b></h2>
          </a>
        </div>
        <div class="precos center-md center-sm center-xs" v-if="type === 'monthly'">
          <img class="img2" src="../assets/Group (1).png" />
        </div>
        <div class="precos center-md center-sm center-xs" v-else>anual</div>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2" style="text-decoration: line-through;">SaaS landing page</h3>
        <div class="row center-md center-sm center-xs"><button class="bt b2">Assinar</button></div>
      </div>
      <div class="cx-4 col-xs col-sm col-xs-12">
        <div class="row center-md center-sm center-xs">
          <a href="#">
            <h2 class="Heading1"><b>ENTERPRISE</b></h2>
          </a>
        </div>
        <div class="precos center-md center-sm center-xs" v-if="type === 'monthly'">
          <img class="img3" src="../assets/Group (2).png" />
        </div>
        <div class="precos center-md center-sm center-xs" v-else>anual</div>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <div class="row center-md center-sm center-xs"><button class="bt b3">Assinar</button></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Plans",
  status: "ready",
  release: "1.0.0",
  model: {
    prop: "active",
  },
  data() {
    return {
      type: "monthly",
    }
  },
  props: {
    /**
     * The html element name used for the nav bar.
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

@media only screen and (min-width: 360px) {
  /* For tablets: */
  .conteiner {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 80px 40px 80px 40px;
  }
  .m1 {
    margin: 0px;
    padding: 0px 0px 0px 0px;
  }
  .m2 {
    margin: 0px;
    padding: 0px;
  }
  // caixas da pagina
  .cx-1 {
    color: $color-primary-60;
    font-size: 24px;
    font-family: Montserrat Alternates;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 {
    color: $color-primary-50;
    text-align: left;
    font-size: 14px;
    font-family: Montserrat Alternates;
    margin: 20px 0px 20px 0px;
    padding: 0px;
  }
  .cx-3 {
    width: 100%;
    padding: 10px;
    margin: 0px 0px 30px 0px;
  }
  .cx-4 {
    background: #e5e5e5;
    margin: 0px 10px 0px 10px;
    border: 0px;
    border-radius: 10px;
  }
  // componentes da caixa
  .cx-3 button {
    width: 25%;
    border: 0px;
    border-radius: 40px;
    background: #e5e5e5;
    color: #c3c5c6;
    cursor: pointer;
    font-size: 16px;
    font-family: Montserrat Alternates;
    margin: 0px -20px 0px -20px;
  }
  .cx-3 button:hover {
    background: $color-accent-3;
    color: $color-white;
  }
  .cx-4:hover {
    background: #a4eff5;
    .bt {
      border: 2px solid #276e73;
      color: #276e73;
    }
  }
  .I1 {
    height: 35px;
    position: relative;
  }
  .I2 {
    height: 35px;
  }
  .bloco {
    padding: 0px 80px 0px 80px;
  }
  .Paragraph2 {
    padding: 0px;
    margin: 8px 0px 8px 0px;
    color: #276e73;
    font-size: 14px;
    font-family: Montserrat Alternates;
    text-align: center;
  }
  .precos {
    width: 50%;
    height: 40px;
    margin: 10px auto 10px auto;
    padding: 0px;
  }
  .img1 {
    width: 60%;
    padding: 0px 0px 0px 0px;
    margin: -6px;
  }
  .img2 {
    width: 100%;
  }
  .img3 {
    width: 50%;
    padding: 8px 0px 12px 0px;
  }
  .Heading1 {
    margin: 20px 0px 10px 0px;
    font-size: 16px;
    font-family: Montserrat;
  }
  a {
    color: $color-primary-60;
  }
  .bt {
    width: 50%;
    height: 40px;
    margin-top: 10px;
    margin-bottom: 20px;
    border-radius: 20px;
    border: 2px solid #4d76c8;
    font-size: 16px;
    color: #4d76c8;
    background: transparent;
    cursor: pointer;
    font-family: Montserrat Alternates;
  }
  .bt:hover {
    width: 51%;
    height: 42px;
  }
  .icon {
    padding: 0px 0px 0px 14px;
    margin: 3px -100px 0px 10px;
    float: left;
  }
}
@media only screen and (min-width: 1025px) {
  /* For desktop: */
  .conteiner {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 80px 40px 80px 40px;
  }
  .liga-desliga {
    margin-bottom: 40px;
    margin-top: 20px;
  }
  .liga-desliga__checkbox {
    position: absolute;
    left: 0px;
    display: none;
  }
  .liga-desliga__botao {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    cursor: pointer;
  }
  .liga-desliga__botao::before,
  .liga-desliga__botao::after {
    content: "";
    font-family: Montserrat Alternates;
    font-size: 18px;
    color: rgb(162, 165, 167);
    padding-top: 5px;
  }
  .liga-desliga__botao::before {
    display: inline-block;
    width: 180px;
    height: 30px;
    border-radius: 15px;
    background: #d6d6d6;
    content: "Anual";
    padding-right: 10px;
    text-align: right;
  }
  .liga-desliga__botao::after {
    position: absolute;
    left: 1px;
    width: 100px;
    height: 30px;
    border-radius: 15px;
    background: #4d76c8;
    content: "Mensal";
    color: white;
  }
  .liga-desliga__checkbox:checked + .liga-desliga__botao::before {
    background: #d6d6d6;
    content: "Mensal";
    padding-left: 10px;
    text-align: left;
  }
  .liga-desliga__checkbox:checked + .liga-desliga__botao::after {
    content: "Anual";
    color: white;
    left: 50%;
  }
  // caixas da pagina
  .cx-1 {
    color: $color-primary-60;
    font-size: 24px;
    font-family: Montserrat Alternates;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 {
    color: $color-primary-50;
    text-align: left;
    font-size: 18px;
    font-family: Montserrat Alternates;
    margin: 20px 0px 20px 0px;
    padding: 0px;
  }
  .cx-3 {
    width: 100%;
    padding: 10px;
    margin: 0px 0px 30px 0px;
  }
  .cx-4 {
    background: #e5e5e5;
    margin: 0px 10px 0px 10px;
    border: 0px;
    border-radius: 10px;
  }
  // componentes da caixa
  .cx-3 button {
    width: 25%;
    border: 0px;
    border-radius: 40px;
    background: #e5e5e5;
    color: #c3c5c6;
    cursor: pointer;
    font-size: 20px;
  }
  .cx-3 button:hover {
    background: $color-accent-3;
    color: $color-white;
  }
  .cx-4:hover {
    background: #a4eff5;
    .bt {
      border: 2px solid #276e73;
      color: #276e73;
    }
  }
  .bloco {
    padding: 0px 80px 0px 80px;
  }
  .Paragraph2 {
    padding: 0px;
    margin: 8px 0px 8px 0px;
    color: #276e73;
    font-size: 16px;
    font-family: Montserrat Alternates;
    text-align: center;
  }
  .precos {
    width: 50%;
    height: 40px;
    margin: 10px auto 10px auto;
    padding: 0px;
  }
  .img1 {
    width: 60%;
    padding: 0px 0px 0px 0px;
    margin: -6px;
  }
  .img2 {
    width: 100%;
  }
  .img3 {
    width: 50%;
    padding: 8px 0px 12px 0px;
  }
  .Heading1 {
    margin: 20px 0px 10px 0px;
    font-size: 16px;
    font-family: Montserrat;
  }
  a {
    color: $color-primary-60;
  }
  .bt {
    width: 50%;
    height: 40px;
    margin-top: 10px;
    margin-bottom: 20px;
    border-radius: 20px;
    border: 2px solid #4d76c8;
    font-size: 16px;
    font-family: Montserrat Alternates;
    color: #4d76c8;
    background: transparent;
    cursor: pointer;
  }
  .bt:hover {
    width: 51%;
    height: 42px;
  }
  .icon {
    padding: 0px 0px 0px 26px;
    margin: 3px -100px 0px 15px;
    float: left;
  }
}
</style>

<docs>
  ```jsx
  <Plans />
  ```
</docs>
