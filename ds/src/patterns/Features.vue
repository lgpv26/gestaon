<template>
  <div class="bloco">
    <div class="row">
      <h1 class="head-1 row center-md col-md-12 center-sm col-sm-12 center-xs col-xs-12">
        Lorem ipsum sit amet orem ipsum sit amet’
      </h1>
    </div>
    <ul class="cx-1 row col-md-12 col-sm-12 col-xs-12">
      <li class="cx-2 col-md col-sm col-xs-12">
        <a class="a1 active" href="#"><h5>Recurso 1</h5></a>
      </li>
      <li class="cx-2 col-md col-sm col-xs-12">
        <a class="a1 active" href="#"><h5>Recurso 2</h5></a>
      </li>
      <li class="cx-2 col-md col-sm col-xs-12">
        <a class="a1 active" href="#"><h5>Recurso 3</h5></a>
      </li>
      <li class="cx-2 col-md col-sm col-xs-12">
        <a class="a1 active" href="#"><h5>Recurso 4</h5></a>
      </li>
      <li class="cx-2 col-md col-sm col-xs-12">
        <a class="a1 active" href="#"><h5>Recurso 5</h5></a>
      </li>
    </ul>
    <div class=" cx-3 row col-md col-sm col-xs-12">
      <div class="col-md col-sm col-xs-12"><img src="../assets/sem.imagens.png" /></div>
      <div class=" col-md col-sm col-xs-12">
        <div class="cx-4 row">
          <div class="b1 row col-md col-sm col-xs-12">
            <div class="row">
              <div class="start-md start-sm start-xs"><img src="../assets/proccess.png" /></div>
              <h2>Lorem ipsum sit amet</h2>
            </div>
            <h3>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </h3>
          </div>
          <div class="b1 row col-md col-sm col-xs-12">
            <div class="row">
              <div class="start-md start-sm start-xs"><img src="../assets/proccess.png" /></div>
              <h2>Lorem ipsum sit amet</h2>
            </div>
            <h3>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </h3>
          </div>
        </div>

        <div class="cx-4 row">
          <div class="b1 row col-md col-sm col-xs-12">
            <div class="row">
              <div class="start-md start-sm start-xs"><img src="../assets/proccess.png" /></div>
              <h2>Lorem ipsum sit amet</h2>
            </div>
            <h3>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </h3>
          </div>
          <div class="b1 row col-md col-sm col-xs-12">
            <div class="row">
              <div class="start-md start-sm start-xs"><img src="../assets/proccess.png" /></div>
              <h2>Lorem ipsum sit amet</h2>
            </div>
            <h3>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Features",
  status: "deprecated",
  release: "1.0.0",
  metaInfo: {
    title: "Primeiro frame",
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

@media only screen and (min-width: 360px) {
  /* For tablets: */
  .bloco {
    max-width: 1200px;
    padding: 40px;
    margin-left: auto;
    margin-right: auto;
  }
  .b1 {
    margin-bottom: 15px;
  }
  .cx-3 img {
    width: 100%;
  }
  .cx-4 img {
    width: 100%;
    margin-left: 0px;
    margin-right: 0px;
  }
  .head-1 {
    text-align: center;
    color: $color-primary-50;
    font-size: 28px;
  }
  .cx-1 {
    margin: 20px 0px 40px 0px;
    padding: 0px 40px 0px 40px;
  }
  .cx-2 {
    background: $color-base-50;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 h5 {
    color: $color-white;
    margin: 0px 0px 0px 0px;
    padding: 20px 0px 20px 0px;
  }
  li {
    list-style: none;
  }
  a {
    text-decoration: none;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
  }
  li.active {
    background: $color-primary-60;
  }
  h5:hover {
    background: $color-primary-60;
  }
  .cx-3 {
    margin: 0px;
    padding: 0px 0px 0px 40px;
  }
  .cx-4 {
    margin: 30px 0px 0px 0px;
    padding: 0px 0px 0px 10px;
  }
  .cx-4 h2 {
    margin: 0px;
    padding: 10px 0px 0px 5px;
    font-size: 16px;
    color: $color-primary-60;
  }
  .cx-4 h3 {
    margin: 0px;
    padding: 0px;
    text-align: left;
    font-size: 14px;
    color: $color-primary-50;
  }
}
@media only screen and (min-width: 1025px) {
  /* For desktop: */
  .bloco {
    max-width: 1200px;
    padding: 40px;
    margin-left: auto;
    margin-right: auto;
  }
  .cx-3 img {
    width: 92%;
    margin-left: 18px;
  }
  .cx-4 img {
    width: 100%;
    margin-left: 0px;
    margin-right: 0px;
  }
  .head-1 {
    text-align: center;
    color: $color-primary-50;
    font-size: 36px;
  }
  .cx-1 {
    margin: 20px 0px 40px 0px;
    padding: 0px 40px 0px 40px;
  }
  .cx-2 {
    background: $color-base-50;
    margin: 0px;
    padding: 0px;
  }
  .cx-2 h5 {
    color: $color-white;
    margin: 0px 0px 0px 0px;
    padding: 20px 0px 20px 0px;
  }
  li {
    list-style: none;
  }
  a {
    text-decoration: none;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
  }
  li.active {
    background: $color-primary-60;
  }
  h5:hover {
    background: $color-primary-60;
  }
  .cx-3 {
    margin: 0px;
    padding: 0px 40px 0px 0px;
  }
  .cx-4 {
    margin: 0px;
    padding: 25px 0px 10px 0px;
  }
  .cx-4 h2 {
    margin: 0px;
    padding: 0px 0px 0px 10px;
    font-size: 24px;
    color: $color-primary-60;
  }
  .cx-4 h3 {
    margin: 0px;
    padding: 0px;
    text-align: left;
    font-size: 22px;
    color: $color-primary-50;
  }
}
</style>

<docs>
  ```jsx
  <Features />
  ```
</docs>
