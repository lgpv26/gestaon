<template>
  <carousel class="index" :data="data"></carousel>
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
// Design Tokens with local scope
$color-template-background: $color-black;
$color-template-background-top: tint($color-template-background, 10%);
$color-template-background-bottom: shade($color-template-background, 5%);
$color-template-text: $color-white;
$color-template-link: $color-accent-3;
.index {
  width: 96%;
  margin-left: 2%;
  margin-right: 2%;
}
.component {
  margin: 0px;
}
.heading {
  color: $color-primary-50;
  font-size: $size-xl;
  text-align: center;
  margin-top: $size-xl;
}
.paragraph1 {
  color: rgb(0, 107, 139);
  margin-bottom: 8px;
  font-size: $size-s;
}
.paragraph2 {
  color: rgb(0, 139, 139);
  margin-bottom: 8px;
}
.text-link {
  color: $color-template-link;
}
.wrapper {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: $space-xxl * 4.5;
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  left: 30%;
  top: 50%;
}
a {
  font-family: $font-text;
  color: $color-primary;
  text-decoration: underline;
}
.active {
  color: $color-base-40;
}
.button {
  margin-top: $size-m;
}
</style>

<docs>
  ```jsx
  <TopBanner />
  ```
</docs>
