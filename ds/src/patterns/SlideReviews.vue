<template>
  <div class="slide
  col-md-12">
    <carousel :scrollPerPage="false" :perPageCustom="[[768, 3]]">
    <slide class="col-md-4">
      <Reviews></Reviews>
    </slide>
    <slide class="col-md-4">
      <Reviews></Reviews>
    </slide>
    <slide class="col-md-4">
      <Reviews></Reviews>
    </slide>
    <slide class="col-md-4">
      <Reviews></Reviews>
    </slide>
    <slide class="col-md-4">
      <Reviews></Reviews>
    </slide>
    </carousel>
  </div>
</template>

<script>
import Vue from "vue";
import VueCarousel from 'vue-carousel';
Vue.use(VueCarousel);

export default {
  name: "SlideReviews",
  status: "ready",
  release: "1.0.0",
}
</script>

<style>
@import "../../src/assets/fonts/montserrat.css";
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";

.slide {
  max-width: 1245px;
  margin: 0px auto 0px auto;
  position: relative;
  background: #ffffff;
}
</style>
