<template>
  <Wrapper class="row">
    <Wrapper class="row center-xs">
      <Heading level="h3" class="cx-1 col-xs-12">Nossos Planos</Heading>
      <Paragraph class="cx-2 col-xs-7 "
        >We believe we have created the most efficient SaaS landing page for your users Landing page
        with features that will convince you to use it for your SaaS business</Paragraph
      >
      <Wrapper class="cx-3 row center-xs">
        <input class="col-xs-1" type="button" value="Mensal" />
        <input class="col-xs-1" type="button" value="Anual" />
      </Wrapper>
    </Wrapper>
    <Wrapper class="cx-4 col-xs">
      <Heading level="h4" class="Heading1">ESSENCIAL</Heading>
      <Wrapper class="precos">Preco</Wrapper>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <button>Assinar</button>
    </Wrapper>
    <Wrapper class="cx-5 col-xs">
      <Heading level="h4" class="Heading1">PROFESSIONAL</Heading>
      <Wrapper class="precos">Preco</Wrapper>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <button>Assinar</button>
    </Wrapper>
    <Wrapper class="cx-6 col-xs ">
      <Heading level="h4" class="Heading1">ENTERPRISE</Heading>
      <Wrapper class="precos">Preco</Wrapper>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <Paragraph class="Paragraph2">SaaS landing page</Paragraph>
      <button>Assinar</button>
    </Wrapper>
  </Wrapper>
</template>

<script>
export default {
  name: "Plans",
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
.cx-1 {
  background: rgb(255, 238, 0);
}
.cx-2 {
  background: rgb(0, 255, 55);
}
.cx-3 {
  background: rgb(174, 0, 255);
}
.cx-4 {
  background: rgb(255, 0, 13);
}
.cx-5 {
  background: rgb(89, 0, 255);
}
.cx-6 {
  background: rgb(72, 255, 0);
}
.Paragraph2 {
  padding: 0px;
  margin: 0px;
}
.precos {
  padding: 0px;
  margin: 0px auto 0px auto;
  width: 100px;
  background: white;
}
.Heading1 {
  padding: 0px;
  margin: 0px;
}
</style>

<docs>
  ```jsx
  <Plans />
  ```
</docs>
