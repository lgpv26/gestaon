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
@import url("https://fonts.googleapis.com/css?family=Montserrat+Alternates");
@import url("https://fonts.googleapis.com/css?family=Montserrat");
.Slide {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
.review-title {
  color: $color-primary-50;
  text-align: center;
  font-size: 30px;
  font-family: Montserrat Alternates;
  margin-bottom: 30px;
  margin-top: 50px;
}
</style>

<docs>
  ```jsx
  <Reviews />
  ```
</docs>
