<template>
  <Wrapper class="row">
    <Heading level="h3" class="color1 col-xs-12">Lorem ipsum sit amet orem ipsum sit amet’</Heading>
    <Wrapper class="color2 col-xs"> <Heading level="h5">Recurso 1</Heading> </Wrapper>
    <Wrapper class="color3 col-xs"> <Heading level="h5">Recurso 2</Heading> </Wrapper>
    <Wrapper class="color4 col-xs"> <Heading level="h5">Recurso 3</Heading> </Wrapper>
    <Wrapper class="color5 col-xs"> <Heading level="h5">Recurso 4</Heading> </Wrapper>
    <Wrapper class="row">
      <Wrapper class="color6 col-xs"></Wrapper>
      <Wrapper class="color7 col-xs">
        <Wrapper class="color1 row">
          <Wrapper class="color6 col-xs"></Wrapper>
          <Wrapper class="color4 col-xs"></Wrapper>
        </Wrapper>
        <Wrapper class="color2 row">
          <Wrapper class="color4 col-xs"></Wrapper>
          <Wrapper class="color6 col-xs"></Wrapper>
        </Wrapper>
      </Wrapper>
    </Wrapper>
  </Wrapper>
</template>

<script>
export default {
  name: "Features",
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

<style>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.color1 {
  background: red;
  padding: 0px;
  margin: 0px;
}
.color2 {
  background: rgb(94, 255, 0);
  padding: 0px;
  margin: 0px;
}
.color3 {
  background: rgb(14, 173, 152);
  padding: 0px;
  margin: 0px;
}
.color4 {
  background: rgb(178, 223, 158);
  padding: 0px;
  margin: 0px;
}
.color5 {
  background: rgb(255, 238, 0);
  padding: 0px;
  margin: 0px;
}
.color6 {
  background: rgb(255, 166, 0);
  padding: 0px;
  margin: 0px;
}
.color7 {
  background: rgb(68, 0, 255);
  padding: 0px;
  margin: 0px;
}
</style>

<docs>
  ```jsx
  <Features />
  ```
</docs>
