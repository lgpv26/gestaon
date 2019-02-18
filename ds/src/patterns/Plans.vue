<template>
  <div class="Plans">
    <div class="n1">
      <div class="v7"><img src="../assets/Vector7.png" /></div>
      <div class="v8"><img src="../assets/Vector8.png" /></div>
      <div class="tx">
        <h3>Nossos Planos</h3>
        <p>
          We believe we have created the most efficient SaaS landing page for your users<br />
          Landing page with features that will convince you to use it for your SaaS business
        </p>
      </div>
      <div class="liga-desliga row center-md col-md-12 center-sm col-sm-12 col-xs-12">
        <input type="checkbox" class="liga-desliga__checkbox" id="liga-desliga" />
        <label for="liga-desliga" class="liga-desliga__botao"></label>
      </div>
      <div class="row col-md-12 cx-1">
        <div class="col-md-3 cx-2">
          <div class="center-md th2"><h2>ESSENCIAL</h2></div>
          <div class="center-md"><img src="#" /></div>
          <Icon size="small" name="Vector" class="icon" style="top:82px;" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <strike><h3 class="Paragraph2">SaaS landing page</h3></strike>
          <strike><h3 class="Paragraph2">SaaS landing page</h3></strike>
          <strike><h3 class="Paragraph2">SaaS landing page</h3></strike>
          <div class="center-md"><button>Assinar</button></div>
        </div>
        <div class="col-md-3 cx-2">
          <div class="center-md th2"><h2>PROFESSIONAL</h2></div>
          <div class="center-md"><img src="#" /></div>
          <Icon size="small" name="Vector" class="icon" style="top:82px;" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <Icon size="small" name="Vector" class="icon" />
          <h3 class="Paragraph2">SaaS landing page</h3>
          <strike><h3 class="Paragraph2">SaaS landing page</h3></strike>
          <div class="center-md"><button>Assinar</button></div>
        </div>
        <div class="col-md-3 cx-2">
          <div class="center-md th2"><h2>ENTERPRISE</h2></div>
          <div class="center-md"><img src="#" /></div>
          <Icon size="small" name="Vector" class="icon" style="top:82px;" />
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
          <div class="center-md"><button>Assinar</button></div>
        </div>
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
@import "../../src/assets/fonts/montserrat.css";

.Plans {
  background: #23272b;
}
.n1 {
  margin: 0px auto -20px auto;
  max-width: 1245px;
  position: relative;
  height: 920px;
}
.icon {
  position: absolute;
  padding: 10px 0px 20px 0px;
  margin: -10px 0px 0px -18px;
  color: #4d76c8;
}
strike {
  color: #276e73;
}
.v7 {
  position: absolute;
  top: 0px;
}
.v7 img {
  width: 100%;
}
.v8 {
  position: absolute;
  top: 0px;
}
.v8 img {
  width: 100%;
}
.tx {
  text-align: center;
  padding-top: 50px;
}
.tx h3 {
  color: #e7e8e8;
  font-family: Montserrat-Alternates;
  font-style: normal;
  font-weight: bold;
  line-height: normal;
  font-size: 23px;
}
.tx p {
  color: #e7e8e8;
  font-family: Montserrat-Alternates;
  font-style: normal;
  line-height: normal;
  font-weight: 300;
  font-size: 15px;
  margin-bottom: 50px;
}
.cx-1 {
  padding: 0px 100px 0px 100px;
  margin: 50px 0px 20px 120px;
}
.cx-2 {
  background: white;
  margin: 0px 10px 0px 20px;
  padding: 0px 20px 0px 25px;
  position: relative;
  border: 2px solid #4d76c8;
  border-radius: 10px;
}
.Paragraph2 {
  color: #276e73;
  font-size: 16px;
  text-align: center;
  font-family: Montserrat-Alternates;
}
.th2 {
  font-family: Montserrat;
  line-height: normal;
  font-weight: bold;
  font-size: 11px;
  font-style: normal;
  text-transform: capitalize;
  color: #587ecc;
  text-decoration: underline;
  text-decoration-color: red;
}
.cx-2 button {
  width: 150px;
  height: 35px;
  border: 1px solid #4d76c8;
  border-radius: 15px;
  color: #4d76c8;
  background: #ffffff;
  margin: 0px 0px 20px 0px;
  cursor: pointer;
  font-family: Montserrat-Alternates;
}
.cx-2:hover {
  background: linear-gradient(250.86deg, #49dfea -10.02%, #0072e4 91.15%);
  .th2 {
    color: #ffffff;
  }
  .Paragraph2 {
    color: #ffffff;
  }
  strike {
    color: #ffffff;
  }
  button {
    background: linear-gradient(250.86deg, #49dfea -10.02%, #0072e4 91.15%);
    border: 1px solid #ffffff;
    color: #ffffff;
  }
  .icon {
    color: #ffffff;
  }
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
  font-family: Montserrat-Alternates;
  font-size: 18px;
  color: rgb(162, 165, 167);
  padding: 0px 0px 0px 0px;
}
.liga-desliga__botao::before {
  display: inline-block;
  width: 180px;
  height: 30px;
  border-radius: 15px;
  background: #ffffff;
  content: "Anual";
  padding: 5px 20px 0px 0px;
  text-align: right;
}
.liga-desliga__botao::after {
  position: absolute;
  left: 1px;
  width: 100px;
  height: 30px;
  border-radius: 15px;
  background: linear-gradient(205.34deg, #49dfea -10.02%, #0072e4 91.15%);
  content: "Mensal";
  color: white;
  padding: 5px 0px 0px 0px;
}
.liga-desliga__checkbox:checked + .liga-desliga__botao::before {
  background: #ffffff;
  content: "Mensal";
  padding-left: 10px;
  padding-right: 0px;
  margin: 0px;
  text-align: left;
}
.liga-desliga__checkbox:checked + .liga-desliga__botao::after {
  content: "Anual";
  color: white;
  padding-left: 0px;
  padding-right: 0px;
  margin: 0px;
  left: 50%;
}
</style>

<docs>
  ```jsx
  <Plans />
  ```
</docs>
