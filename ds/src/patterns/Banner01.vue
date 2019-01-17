<template>
  <div class="banner row">
    <h1 class="col-xs-12">Lorem ipsum sit amet arem ipsum sit amet'</h1>
    <div class="col-xs-12 col-sm-8 col-md-6 col-lg-6 cx-1">
      <div class="start-xs ">
        <p class="p1">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
      </div>
      <div class="start-xs ">
        <p class="p2">
          Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
          nulla pariatur. Excepteur sint<br />accaecat cupidatat
        </p>
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
  margin: 20px 0px 50px 0px;
}
.cx-1 {
  padding: 40px;
}
.cx-2 {
  padding: 30px;
}
h1 {
  text-align: center;
  color: $color-primary-50;
  font-size: 36px;
}
.p1 {
  margin: 0px 0px 0px 30px;
  padding: 0px;
  font-size: 26px;
  text-align: left;
  color: $color-primary-40;
}
.p2 {
  margin: 10px 0px 0px 30px;
  padding: 0px;
  font-size: 32px;
  text-align: left;
  color: $color-primary-50;
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
  height: 80%;
  border-radius: 10px;
}
</style>

<docs>
  ```jsx
  <Banner01 />
  ```
</docs>
