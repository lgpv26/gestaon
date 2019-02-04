<template>
  <div class="conteiner row">
    <div class="cx-2 row">
      <div class="cx-3 col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <div class="cx-4"><img src="../assets/proccess.BG.png" /></div>
        <h2 class="pr-1">Lorem ipsum sit amet</h2>
        <h3 class="pr-2">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat
        </h3>
      </div>
      <div class="cx-3 col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <div class="cx-4"><img src="../assets/proccess.BG.png" /></div>
        <h2 class="pr-1">Lorem ipsum sit amet</h2>
        <h3 class="pr-2">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat
        </h3>
      </div>
      <div class="cx-3 col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <div class="cx-4"><img src="../assets/proccess.BG.png" /></div>
        <h2 class="pr-1">Lorem ipsum sit amet</h2>
        <h3 class="pr-2">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "Banner02",
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
@import url("https://fonts.googleapis.com/css?family=Montserrat+Alternates");
@import url("https://fonts.googleapis.com/css?family=Montserrat");
.conteiner {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0px 40px 0px 40px;
}
.cx-2 {
  margin-left: auto;
  margin-right: auto;
  width: 90%;
}
.cx-3 {
  padding: 0px 30px 0px 40px;
  width: 90%;
}
.cx-3 .pr-1 {
  text-align: left;
  margin: 0px;
  padding: 0px 0px 0px 10px;
  color: $color-primary-60;
  font-size: 18px;
  font-family: Montserrat Alternates;
}
.cx-3 .pr-2 {
  text-align: left;
  margin: 0px;
  padding: 10px 0px 100px 10px;
  color: $color-primary-50;
  font-size: 16px;
  font-family: Montserrat Alternates;
}
.cx-4 {
  width: 100px;
  border-radius: 100px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}
</style>

<docs>
  ```jsx
  <Banner02/>
  ```
</docs>
