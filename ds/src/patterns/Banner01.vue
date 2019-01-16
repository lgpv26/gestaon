<template>
  <Wrapper class="Wrapper1 row">
    <Heading level="h3" class="Heading1 col-xs-12"
      >Lorem ipsum sit amet arem ipsum sit amet'</Heading
    >
    <Wrapper class="Wrapper2 col-xs">
      <Paragraph class="paragraph1">
        Lorem ipsum dolor sit amet, consectetur adipiscing.
      </Paragraph>
      <Paragraph class="paragraph2">
        Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
        nulla pariatur. Excepteur sint<br />accaecat cupidatat
      </Paragraph>
      <button>Explorar Recursos</button>
    </Wrapper>
    <Wrapper class="Wrapper3 col-xs">
      <img
        src="https://lh4.googleusercontent.com/7BLk-Wo82esCj_VCPqlj6ONX6q4vdSw0Ui6mfL4g7Pdu-oLxU0K0Y1_CmZBW-tf-a8ANIwm87LVuTw=w1366-h657"
      />
    </Wrapper>
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
$color-template-background: $color-white;
$color-template-background-top: tint($color-template-background, 10%);
$color-template-background-bottom: shade($color-template-background, 5%);
$color-template-text: $color-white;
$color-template-link: $color-accent-3;

.Wrapper1 {
  @include reset;
  @include inset-space($space-m);
  min-height: $space-xxl * 4;
  background: $color-white;
  position: relative;
  float: left;
}
.Heading1 {
  text-align: center;
  color: $color-primary-60;
  margin-top: 40px;
  padding-bottom: 0px;
}
.Wrapper2 {
  width: 100%;
  margin: 0px;
  padding: 0px;
  text-align: left;
}
.Wrapper3 {
  width: 100%;
  margin: 0px;
  padding: 0px;
}
.paragraph1 {
  margin: 10px 0px 0px 120px;
  padding: 0px;
  color: $color-primary-40;
  font-size: $size-l - 5;
}
.paragraph2 {
  margin: 4px 0px 10px 120px;
  padding: 0px;
  color: $color-primary-50;
  font-size: $size-l;
}
.Wrapper2 button {
  margin: 0px 0px 0px 120px;
  padding: 0px;
  border: 0px;
  border-radius: 6px;
  color: $color-white;
  background: $color-primary-50;
  width: 40%;
  height: 18%;
}
.Wrapper3 img {
  margin: 4px 0px 0px 0px;
  padding: 0px;
  width: 60%;
  border-radius: 15px;
  text-align: center;
}

@media screen and(max-width: 1024px) {
  .Wrapper1 {
    @include reset;
    @include inset-space($space-m);
    min-height: $space-xxl * 4;
    background: $color-white;
    position: relative;
    float: left;
  }
  .Heading1 {
    text-align: center;
    color: $color-primary-60;
    margin-top: 40px;
    padding-bottom: 0px;
    font-size: $size-l + 4;
  }
  .Wrapper2 {
    width: 100%;
    margin: 0px;
    padding: 0px;
    text-align: left;
  }
  .Wrapper3 {
    width: 100%;
    margin: 0px;
    padding: 0px;
  }
  .paragraph1 {
    margin: 10px 0px 0px 40px;
    padding: 0px;
    color: $color-primary-40;
    font-size: $size-m;
  }
  .paragraph2 {
    margin: 4px 0px 10px 40px;
    padding: 0px;
    color: $color-primary-50;
    font-size: $size-m + 5;
  }
  .Wrapper2 button {
    margin: 0px 0px 0px 40px;
    padding: 0px;
    border: 0px;
    border-radius: 6px;
    color: $color-white;
    background: $color-primary-50;
    width: 50%;
    height: 18%;
  }
  .Wrapper3 img {
    margin: 10px 0px 0px 0px;
    padding: 0px;
    width: 80%;
    border-radius: 15px;
    text-align: center;
  }
}
</style>

<docs>
  ```jsx
  <Banner01 />
  ```
</docs>
