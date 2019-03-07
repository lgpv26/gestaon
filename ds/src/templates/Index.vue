<template>
  <component :is="type" class="index">
    <TopBanner />
    <Process />
    <Advantages />
    <Features />
    <SlideReviews />
    <Plans />
    <Footer />
  </component>
</template>

<script>
/**
 * Shows how to layout and structure a home page.
 */
export default {
  name: "Index",
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
.index {
  margin: 0px;
  padding: 0px;
}
</style>

<docs>
  ```jsx
  <Index />
  ```
</docs>
