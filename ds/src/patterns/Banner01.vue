<template>
  <div class="banner row">
    <h1 class="col-xs-12">Lorem ipsum sit amet arem ipsum sit amet'</h1>
    <div class="col-xs-12 col-sm-8 col-md-6 col-lg-6 cx-1">
      <div class="start-xs ">
        <h2 class="p1">Lorem ipsum dolor sit amet, consectetur adipiscing.</h2>
      </div>
      <div class="start-xs ">
        <h3 class="p2">
          Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
          nulla pariatur. Excepteur sint<br />accaecat cupidatat
        </h3>
      </div>
      <div class="start-xs"><button>Explorar Recursos</button></div>
    </div>
    <div class="col-xs-12 col-sm-8 col-md-6 col-lg-6 cx-2">
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
.banner {
  max-width: 1200px;
  padding: 40px;
  margin-left: auto;
  margin-right: auto;
}
.cx-1 {
  padding: 30px 0px 0px 60px;
}
.cx-2 {
  padding: 0px 0px 0px 0px;
}
h1 {
  text-align: center;
  color: $color-primary-50;
  font-size: 36px;
}
.p1 {
  margin: 0px 0px 0px 30px;
  padding: 0px;
  font-size: 21px;
  text-align: left;
  color: $color-primary-50;
}
.p2 {
  margin: 10px 0px 0px 30px;
  padding: 0px;
  font-size: 28px;
  text-align: left;
  color: $color-primary-60;
}
button {
  margin: 20px 0px 0px 30px;
  width: 50%;
  height: 50px;
  border-radius: 5px;
  border: 0px;
  font-size: 18px;
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
  width: 80%;
  height: 90%;
  border-radius: 10px;
}
</style>

<docs>
  ```jsx
  <Banner01 />
  ```
</docs>
