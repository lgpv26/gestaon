<template>
  <Wrapper class="Wrapper1">
    <Heading level="h3" class="Heading1 cx-1">Lorem ipsum sit amet orem ipsum sit amet’</Heading>
    <Wrapper class="Wrapper2">
      <Wrapper class="cx-2"></Wrapper>
      <Wrapper class="cx-3"></Wrapper>
      <Wrapper class="cx-4"></Wrapper>
    </Wrapper>
  </Wrapper>
</template>

<script>
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "Proccess",
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

<style lang="scss" scoped></style>

<docs>
  ```jsx
  <Proccess/>
  ```
</docs>
