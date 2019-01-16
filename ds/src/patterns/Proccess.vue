<template>
  <Wrapper class="conteiner row">
    <Heading level="h3" class="cx-1 col-xs-12">Lorem ipsum sit amet orem ipsum sit amet’</Heading>
    <Wrapper class="row">
      <Wrapper class="cx-2 col-xs">
        <Wrapper class="cx-3"><img src=""/></Wrapper>
        <Paragraph class="Paragraph1 col-xs-12 ">Lorem ipsum sit amet</Paragraph>
        <Paragraph class="Paragraph2 col-xs-12 "
          >Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat</Paragraph
        >
      </Wrapper>
      <Wrapper class="cx-2 col-xs">
        <Wrapper class="cx-3"><img src=""/></Wrapper>
        <Paragraph class="Paragraph1 col-xs-12 ">Lorem ipsum sit amet</Paragraph>
        <Paragraph class="Paragraph2 col-xs-12 "
          >Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat</Paragraph
        >
      </Wrapper>
      <Wrapper class="cx-2 col-xs">
        <Wrapper class="cx-3"><img src=""/></Wrapper>
        <Paragraph class="Paragraph1 col-xs-12 ">Lorem ipsum sit amet</Paragraph>
        <Paragraph class="Paragraph2 col-xs-12 "
          >Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat</Paragraph
        >
      </Wrapper>
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

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.conteiner {
  margin-left: auto;
  margin-right: auto;
}
.cx-1 {
  color: $color-primary-60;
}
.cx-2 {
  padding-top: 0px;
  margin-left: 12px;
  margin-right: 12px;
}
.cx-3 {
  background: rgba(0, 0, 0, 0.678);
  text-align: center;
  width: 40px;
  height: 40px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  border-radius: 80px;
}
.Paragraph1 {
  font-size: $size-l;
  text-align: left;
  padding: 0px;
  width: 86%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  color: $color-primary-50;
}
.Paragraph2 {
  font-size: $size-l - 5;
  text-align: left;
  padding: 0px;
  width: 86%;
  margin-left: auto;
  margin-right: auto;
  color: $color-primary-40;
}
@media screen and(max-width: 1024px) {
  .conteiner {
    margin-left: auto;
    margin-right: auto;
  }
  .cx-1 {
    color: $color-primary-60;
    font-size: $size-l + 4;
  }
  .Paragraph1 {
    font-size: $size-m + 5;
    text-align: left;
    padding: 0px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 10px;
    color: $color-primary-50;
  }
  .Paragraph2 {
    font-size: $size-m;
    text-align: left;
    padding: 0px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    color: $color-primary-40;
  }
}
</style>

<docs>
  ```jsx
  <Proccess/>
  ```
</docs>
