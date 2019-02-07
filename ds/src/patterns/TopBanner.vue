<template>
  <div class="Banner row col-md-12" :style="'background-image: url(' + img + ')'">
    <div class="cx-1 col-md-6">
      <div class="v1 start-md"><Icon name="card" size="" /></div>
      <div class="cx-2">
        <h1 class="font">sua revenda de GLP em um novo nível!</h1>
        <Paragraph class="paragraph"
          >Sistema de atendimento e logística nos segundos de uma ligação</Paragraph
        >
      </div>
      <div class="cx-3">
        <button class="acess">
          <h1>Acesse grátis</h1>
          <Paragraph class="days" style text-align="center">30 dias, sem compromisso</Paragraph>
        </button>
      </div>
    </div>
    <div v-html="loja" style="position: relative;top:150px;left:80px;"></div>
    <div v-html="butijao" style="position: relative;top:520px;left:40px;z-index:1;"></div>
    <div style="position: relative;top:-100px;left:1400px;">
      <img src="..\assets\plantel-gas.png" />
    </div>
    <div style="position: relative;top:140px;left:80px;"><img src="..\assets\PINS.png" /></div>
    <div style="position: relative;top:280px;right:0px;"><img src="..\assets\Group.png" /></div>
  </div>
</template>

<script>
const req = require.context("@/assets/icons/", true, /^\.\/.*\.svg$/)
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "TopBanner",
  status: "ready",
  release: "1.0.0",
  data() {
    return {
      img: require("./Top-banner-1.png"),
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
@import "../../src/assets/fonts/dax.css";
.Banner {
  margin: 0px auto 0px auto;
  padding: 0px;
  max-width: 1500px;
}

.v1 {
  margin: 0px;
  padding: 0px 0px 0px 50px;
}
.cx-2 {
  margin: 0px;
  padding: 0px 50px 0px 50px;
  .font {
    font-family: Dax-Bold;
  }
  .paragraph {
    font-family: DaxCondensed;
  }
}

.cx-2 h1 {
  margin: 0px;
  padding: 0px;
  line-height: normal;
  font-size: 38px;
  text-transform: uppercase;
  color: white;
  text-align: left;
}
.cx-2 p {
  margin: 0px;
  padding: 0px;
  font-size: 18px;
  color: white;
  text-align: left;
}
.cx-1 button {
  margin: 10px 0px 0px 50px;
  padding: 0px;
  border: 0px;
  border-radius: 10px;
  width: 200px;
  height: 80px;
  float: left;
  background: linear-gradient(217.73deg, #49dfea -10.02%, #be668d -10.02%, #0072e4 91.15%);
}
button h1 {
  margin: 0px;
  padding: 0px;
  color: white;
  font-size: 26px;
}
button p {
  margin: 0px;
  padding: 0px;
  font-size: 14px;
  color: white;
}
.cx-3 {
  margin: 0px;
  padding: 0px;
  color: white;
  .acess {
    font-family: "Dax-Bold-Italic";
    font-size: 36px;
  }
  .days {
    color: white;
    font-family: "Dax-Italic";
    text-align: center;
  }
}
</style>

<docs>
  ```jsx
  <TopBanner/>
  ```
</docs>
