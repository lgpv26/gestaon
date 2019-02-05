<template>
  <component :is="type">
    <div class="row">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4"><div class="box">Responsive</div></div>
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4"><div class="box">Responsive</div></div>
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4"><div class="box">Responsive</div></div>
    </div>
  </component>
</template>

<script>
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "Section1",
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
</style>

<docs>
  ```jsx
  <Section1/>
  ```
</docs>
