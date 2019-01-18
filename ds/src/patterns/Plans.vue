<template>
  <div class="row">
    <div class="row center-xs">
      <h2 class="cx-1 col-xs-12">Nossos Planos</h2>
      <h3 class="cx-2 col-xs-7 ">
        We believe we have created the most efficient SaaS landing page for your users Landing page
        with features that will convince you to use it for your SaaS business
      </h3>
    </div>
    <div class="row center-xs col-xs-12">
      <div class="cx-3">
        <input class="I1" type="button" value="Mensal" />
        <input class="I2" type="button" value="Anual" />
      </div>
    </div>
    <div class="bloco row col-xs-12">
      <div class="cx-4 col-xs">
        <div class="row center-xs">
          <a href="#"> <h2 class="Heading1">ESSENCIAL</h2> </a>
        </div>
        <div class="precos"><img class="img1" src="../assets/Group.png" /></div>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <div class="row center-xs"><button class="bt b1">Assinar</button></div>
      </div>
      <div class="cx-4 col-xs">
        <div class="row center-xs">
          <a href="#"> <h2 class="Heading1">PROFESSIONAL</h2> </a>
        </div>
        <div class="precos"><img class="img2" src="../assets/Group (1).png" /></div>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <div class="row center-xs"><button class="bt b2">Assinar</button></div>
      </div>
      <div class="cx-4 col-xs ">
        <div class="row center-xs">
          <a href="#"> <h2 class="Heading1">ENTERPRISE</h2> </a>
        </div>
        <div class="precos"><img class="img3" src="../assets/Group (2).png" /></div>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <h3 class="Paragraph2">SaaS landing page</h3>
        <div class="row center-xs"><button class="bt b3">Assinar</button></div>
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
.cx-1 {
  color: $color-primary-60;
  font-size: 36px;
  margin: 0px;
  padding: 0px;
}
.cx-2 {
  color: $color-primary-50;
  text-align: left;
  font-size: 22px;
  margin: 20px 0px 20px 0px;
  padding: 0px;
}
.cx-3 {
  width: 100%;
  padding: 10px;
  margin: 0px 0px 30px 0px;
}
.cx-3 input[type="button"] {
  width: 10%;
  border: 0px;
  border-radius: 40px;
  background: #e5e5e5;
  color: #c3c5c6;
  cursor: pointer;
  font-size: 24px;
}
input[type="button"]:hover {
  background: $color-accent-3;
  color: $color-white;
}
.I1 {
  margin-right: -15px;
  height: 35px;
  position: relative;
}
.I2 {
  margin-left: -15px;
  height: 35px;
}
.bloco {
  padding: 0px 80px 0px 80px;
}
.cx-4 {
  background: #e5e5e5;
  margin: 0px 10px 40px 10px;
  border: 0px;
  border-radius: 10px;
}
.cx-4:hover {
  background: #a4eff5;
  .bt {
    border: 2px solid #276e73;
    color: #276e73;
  }
}
.Paragraph2 {
  padding: 0px;
  margin: 8px 0px 8px 0px;
  color: #276e73;
  font-size: 18px;
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
  font-size: 18px;
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
  font-size: 18px;
  color: #4d76c8;
  background: transparent;
  cursor: pointer;
}
.bt:hover {
  width: 51%;
  height: 42px;
}
</style>

<docs>
  ```jsx
  <Plans />
  ```
</docs>
