<template>
  <div class="conteiner"></div>
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
.conteiner {
  max-width: 1200px;
  padding: 40px;
  margin-left: auto;
  margin-right: auto;
}
</style>

<docs>
  ```jsx
  <Footer />
  ```
</docs>
