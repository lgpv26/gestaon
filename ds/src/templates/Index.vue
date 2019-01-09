<template>
  <component :is="type" class="index">
    <NavBar
      active="Index"
      :navItems="[
        { name: 'Template', component: 'Index', href: '/#/' },
        { name: 'Documentation', href: 'http://localhost:6060/' },
        { name: 'Link de teste', href: '/#/' },
      ]"
    />
    <Wrapper>
      <Heading>GestaON Design System</Heading>
      <Paragraph>
        <a href="https://vueds.com">GestaON DS</a> is an open-source tool for building design
        systems with Vue.js. It provides you and your team a set of organized tools, patterns &amp;
        practices. It works as the foundation for your application development.
      </Paragraph>
      <Button variation="primary" size="large">Primary Button</Button>
    </Wrapper>
    <TopBanner />
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
// Design Tokens with local scope
$color-template-background: $color-black;
$color-template-background-top: tint($color-template-background, 10%);
$color-template-background-bottom: shade($color-template-background, 5%);
$color-template-text: $color-white;
$color-template-link: $color-accent-3;

.index {
  @include reset;
  @include inset-space($space-m);
  min-height: $space-xxl * 4;
  background: $color-template-background;
  background: linear-gradient(
    0deg,
    $color-template-background-bottom,
    $color-template-background-top 100%
  );
  text-align: center;
  position: relative;
  float: left;
  height: 100%;
  width: 100%;
  @media #{$media-query-l} {
    // This is how you’d use design tokens with media queries
  }
  .heading {
    color: $color-template-text;
  }
  .paragraph {
    color: $color-template-text;
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
    left: 50%;
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
}
</style>

<docs>
  ```jsx
  <Index />
  ```
</docs>
