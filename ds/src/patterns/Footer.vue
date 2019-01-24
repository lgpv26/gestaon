<template>
  <div class="row col-md-12">
    <div class="col-md">caixa -1</div>
    <div class="col-md">caixa -2</div>
    <div class="col-md">caixa -3</div>
  </div>
</template>

<script>
/**
 * Shows how to layout and structure a home page.
 */
export default {
  name: "Footer",
  status: "deprecated",
  release: "1.0.0",
  metaInfo: {
    title: "Rodape",
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
.cx-1 {
  background: rgb(25, 0, 255);
}
.cx-2 {
  background: red;
}
.cx-3 {
  background: red;
}
.cx-4 {
  background: red;
}
.cx-5 {
  background: red;
}
.cx-6 {
  background: red;
}
</style>

<docs>
  ```jsx
  <Footer />
  ```
</docs>
