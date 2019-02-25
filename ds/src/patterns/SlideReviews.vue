<template>
  <div class="SlideReviews"><carousel class="index" :data="data"> </carousel></div>
</template>

<script>
import Vue from "vue"
import VueCarousel from "@chenfengyuan/vue-carousel"
Vue.component(VueCarousel.name, VueCarousel)

export default {
  name: "SlideReviews",
  status: "ready",
  release: "1.0.0",
  data() {
    return {
      data: [`<Reviews/><Reviews/><Reviews/>`, `<Reviews/>`],
    }
  },
}
</script>

<style>
@import "../../src/assets/fonts/montserrat.css";
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";

.SlideReviews {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  height: 350px;
  background: #ffffff;
}
</style>
