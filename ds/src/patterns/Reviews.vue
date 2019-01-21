<template>
  <div class="Slide">
    <h1 class="review-title cx-1 col-xs-12">Lorem ipsum sit amet orem ipsum sit amet’</h1>
    <carousel class="index" :data="data"></carousel>
  </div>
</template>

<script>
import Vue from "vue"
import VueCarousel from "@chenfengyuan/vue-carousel"
Vue.component(VueCarousel.name, VueCarousel)
/**
 * Used as main page navigation in templates.
 */
export default {
  data() {
    return {
      data: [
        '<div class="example-slide"><Banner02 /></div>',
        '<div class="example-slide"><Banner02 /></div>',
        '<div class="example-slide"><Banner02 /></div>',
      ],
    }
  },
  name: "Reviews",
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
.Slide {
  width: 100%;
  max-width: 1200px;
  padding: 40px;
  margin-left: auto;
  margin-right: auto;
}
.review-title {
  color: $color-primary-60;
  font-size: 24px;
  text-align: center;
}
</style>

<docs>
  ```jsx
  <Reviews />
  ```
</docs>
