<template>
  <div class="Slide"><carousel class="index" :data="data"></carousel></div>
</template>

<script>
import Vue from "vue"
import VueCarousel from "@chenfengyuan/vue-carousel"
Vue.component(VueCarousel.name, VueCarousel)

export default {
  data() {
    return {
      data: [
        '<div class="example-slide"><Banner01 /></div>',
        '<div class="example-slide"><Banner01 /></div>',
        '<div class="example-slide"><Banner01 /></div>',
      ],
    }
  },
  name: "TopBanner",
  status: "deprecated",
  release: "1.0.0",
  metaInfo: {
    title: "GestaON DS",
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
.Slide {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}
</style>

<docs>
  ```jsx
  <TopBanner />
  ```
</docs>
