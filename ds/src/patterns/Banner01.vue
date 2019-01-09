<template>
  <Wrapper class="Wrapper1">
    <Heading level="h3">Lorem ipsum sit amet arem ipsum sit amet'</Heading>
    <Wrapper class="Wrapper2">
      <Paragraph class="paragraph1">
        Lorem ipsum dolor sit amet, consectetur adipiscing.
      </Paragraph>
      <Paragraph class="paragraph2">
        Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
        nulla pariatur. Excepteur sint<br />accaecat cupidatat
      </Paragraph>
      <Button variation="primary" size="large">Primary Button</Button>
    </Wrapper>
    <Wrapper class="Wrapper3"> <img class="img1" src="" /> <img class="img2" src="" /> </Wrapper>
  </Wrapper>
</template>

<script>
/**
 * Shows how to layout and structure a home page.
 */
export default {
  name: "Banner01",
  status: "deprecated",
  release: "1.0.0",
  metaInfo: {
    title: "Primeiro frame",
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
// Design Tokens with local scope
$color-template-background: $color-black;
$color-template-background-top: tint($color-template-background, 10%);
$color-template-background-bottom: shade($color-template-background, 5%);
$color-template-text: $color-white;
$color-template-link: $color-accent-3;

.Wrapper1 {
  @include reset;
  @include inset-space($space-m);
  min-height: $space-xxl * 4;
  background: $color-base-10;
  position: relative;
  float: left;
  height: 100%;
  width: 100%;
  @media #{$media-query-l} {
    // This is how you’d use design tokens with media queries
  }
}
.Wrapper2 {
  width: 50%;
  height: 100%;
  float: left;
}
.Wrapper3 {
  width: 50%;
  height: 100%;
  float: left;
}
.Wrapper3 .img1 {
  width: 80%;
  height: 80%;
  float: left;
  border-radius: 10px;
}
.Wrapper3 .img2 {
  width: 40%;
  height: 40%;
  border-radius: 10px;
}
.Heading {
  text-align: center;
}
</style>

<docs>
  ```jsx
  <Banner01 />
  ```
</docs>
