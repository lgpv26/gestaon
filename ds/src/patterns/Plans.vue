<template>
  <div class="conteiner row">
    <div class=" row center-md center-sm center-xs">
      <h2 class="cx-1 col-md-12 col-sm-12 col-xs-12">Nossos Planos</h2>
      <h3 class="cx-2 col-md-8 col-sm-8 col-xs-8">
        We believe we have created the most efficient SaaS landing page for your users Landing page
        with features that will convince you to use it for your SaaS business
      </h3>
    </div>
    <div class="row center-md col-md-12 center-sm col-sm-12 col-xs-12">
      <div class="m1 cx-3 end-md col-md-6 end-sm col-sm-6 center-xs col-xs-12">
        <button class="I1" @click="type = 'monthly'">Mensal</button>
      </div>
      <div class="m2 cx-3 start-md col-md-6 start-sm col-sm-6 center-xs col-xs-12">
        <button class="I2" @click="type = 'yearly'">Anual</button>
      </div>
    </div>
    <div class="bloco row col-md-12 col-sm-12 col-xs-12">
      <div class="cx-4 col-md col-sm col-xs-12">
        <div class="row center-md center-sm center-xs">
          <a href="#"> <h2 class="Heading1">ESSENCIAL</h2> </a>
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
          <a href="#"> <h2 class="Heading1">PROFESSIONAL</h2> </a>
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
          <a href="#"> <h2 class="Heading1">ENTERPRISE</h2> </a>
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

@media only screen and (min-width: 360px) {
  /* For tablets: */
  .conteiner {
    max-width: 1200px;
    padding: 40px;
    margin-left: auto;
    margin-right: auto;
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
    font-size: 28px;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 {
    color: $color-primary-50;
    text-align: left;
    font-size: 16px;
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
    margin: 0px 10px 40px 10px;
    border: 0px;
    border-radius: 10px;
  }
  // componentes da caixa
  .cx-3 button {
    width: 20%;
    border: 0px;
    border-radius: 40px;
    background: #e5e5e5;
    color: #c3c5c6;
    cursor: pointer;
    font-size: 16px;
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
    display: flex;
  }
  .Paragraph2 {
    padding: 0px;
    margin: 8px 0px 8px 0px;
    color: #276e73;
    font-size: 16px;
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
    padding: 40px;
    margin-left: auto;
    margin-right: auto;
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
    font-size: 36px;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 {
    color: $color-primary-50;
    text-align: left;
    font-size: 20px;
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
    margin: 0px 10px 40px 10px;
    border: 0px;
    border-radius: 10px;
  }
  // componentes da caixa
  .cx-3 button {
    width: 20%;
    border: 0px;
    border-radius: 40px;
    background: #e5e5e5;
    color: #c3c5c6;
    cursor: pointer;
    font-size: 24px;
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
    margin-right: -21px;
    height: 35px;
    position: relative;
    float: right;
  }
  .I2 {
    margin-left: -21px;
    padding-right: 0px;
    height: 35px;
    float: left;
  }
  .bloco {
    padding: 0px 80px 0px 80px;
    display: flex;
  }
  .Paragraph2 {
    padding: 0px;
    margin: 8px 0px 8px 0px;
    color: #276e73;
    font-size: 20px;
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
    font-size: 20px;
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
    font-size: 20px;
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
