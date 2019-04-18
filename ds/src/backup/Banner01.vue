<template>
  <div class=" banner row ">
    <h1 class="center-md col-md-12 center-sm col-sm-12 center-xs col-xs-12 ">
      Lorem ipsum sit amet arem ipsum sit amet'
    </h1>
    <div class="xs-1 cx-1 col-md-6 col-sm-6 col-xs-12">
      <div class="col-md-12 col-sm-12 col-xs-12">
        <h2 class="p1 start-md col-md-12 start-sm col-sm-12 center-xs col-xs-12">
          Lorem ipsum dolor sit amet, consectetur adipiscing.
        </h2>
        <h3 class="p2 start-md col-md-12 start-sm col-sm-12 center-xs col-xs-12">
          Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
          nulla pariatur. Excepteur sint<br />accaecat cupidatat
        </h3>
      </div>
      <div class="start-md col-md-10 start-sm col-sm-10 center-xs col-xs-12">
        <button class="center-md col-md-12 col-xs-12">Explorar Recursos</button>
      </div>
    </div>
    <div class="xs-2 cx-2 end-md col-md-6 center-sm col-sm-6 center-xs col-xs-12 ">
      <img src="../assets/sem.imagens.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Banner01",
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
@import url("https://fonts.googleapis.com/css?family=Montserrat+Alternates");
@import url("https://fonts.googleapis.com/css?family=Montserrat");
.xs-1 {
  margin-bottom: 20px;
}

@media only screen and (min-width: 360px) {
  /* For tablets: */
  .banner {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 22px;
    margin-bottom: 0px;
    padding: 0px 40px 0px 40px;
  }
  .cx-1 {
    padding: 10px 0px 0px 10px;
  }
  .cx-2 {
    padding: 0px 0px 0px 0px;
  }
  h1 {
    color: $color-primary-50;
    font-size: 26px;
    font-family: Montserrat Alternates;
  }
  .p1 {
    margin: 20px 0px 0px 0px;
    padding: 0px;
    font-size: 12px;
    font-family: Montserrat Alternates;
    color: $color-primary-50;
  }
  .p2 {
    margin: 10px 0px 10px 0px;
    padding: 0px;
    font-size: 14px;
    font-family: Montserrat Alternates;
    color: $color-primary-60;
  }
  button {
    width: 60%;
    height: 40px;
    border-radius: 5px;
    border: 0px;
    font-size: 16px;
    font-family: Montserrat;
    color: white;
    background: $color-primary-60;
    cursor: pointer;
  }
  button:hover {
    width: 61%;
    height: 41px;
  }
  img {
    width: 88%;
    height: 80%;
    border-radius: 10px;
  }
}

@media only screen and (min-width: 1025px) {
  /* For desktop: */
  .banner {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 22px;
    margin-bottom: 0px;
    padding: 40px 40px 0px 40px;
  }
  .cx-1 {
    padding: 30px 0px 0px 60px;
    margin: 0px;
  }
  .cx-2 {
    padding: 0px 0px 0px 0px;
  }
  h1 {
    text-align: center;
    color: $color-primary-50;
    font-family: Montserrat Alternates;
    font-size: 30px;
  }
  .p1 {
    margin: 0px 0px 0px 30px;
    padding: 0px;
    font-size: 16px;
    font-family: Montserrat Alternates;
    text-align: left;
    color: $color-primary-50;
  }
  .p2 {
    margin: 10px 0px 0px 30px;
    padding: 0px;
    font-size: 22px;
    font-family: Montserrat Alternates;
    text-align: left;
    color: $color-primary-60;
  }
  button {
    margin: 20px 0px 0px 30px;
    width: 50%;
    height: 50px;
    border-radius: 5px;
    border: 0px;
    font-size: 16px;
    font-family: Montserrat;
    color: white;
    background: $color-primary-60;
    cursor: pointer;
    float: left;
  }
  button:hover {
    width: 51%;
    height: 54px;
  }
  img {
    width: 88%;
    height: 80%;
    border-radius: 10px;
  }
}
</style>

<docs>
  ```jsx
  <Banner01 />
  ```
</docs>
