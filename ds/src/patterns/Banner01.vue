<template>
  <Wrapper class="Wrapper1">
    <Heading level="h3" class="Heading1 cx-1">Lorem ipsum sit amet arem ipsum sit amet'</Heading>
    <Wrapper class="Wrapper2 cx-2">
      <Paragraph class="paragraph1">
        Lorem ipsum dolor sit amet, consectetur adipiscing.
      </Paragraph>
      <Paragraph class="paragraph2">
        Duis aute irure dolor in reprehenderit<br />in voluptate velit esse cillum dolore eu<br />fugiat
        nulla pariatur. Excepteur sint<br />accaecat cupidatat
      </Paragraph>
      <button>Explorar Recursos</button>
    </Wrapper>
    <Wrapper class="Wrapper3 cx-3">
      <img
        src="https://lh3.googleusercontent.com/yZ74mRJ6EQGfl8S2tHlQtZYD67i_KFrptJdAiThCrFVpuqMcSuGE723TtyGcaWIaC6iN7TfvGhqMIZZuh1C2=w1366-h657"
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
  height: 80vh;
  display: grid;
  grid-template-columns: 50% 50% 50% 50%;
  grid-template-rows: 20vh 40vh 40vh 20vh;
  grid-template-areas:
    "Cabecalho Cabecalho"
    "Button  Imagem"
    "Rodape Rodape";
  @media #{$media-query-l} {
    // This is how you’d use design tokens with media queries
  }
}
.cx-1 {
  grid-area: Cabecalho;
}
.cx-2 {
  grid-area: Button;
}
.cx-3 {
  grid-area: Imagem;
}
.cx-4 {
  grid-area: Rodape;
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
    height: 65vh;
    display: grid;
    grid-template-columns: 50% 50% 50% 50%;
    grid-template-rows: 20vh 34vh 34vh 20vh;
    grid-template-areas:
      "Cabecalho Cabecalho"
      "Button  Imagem"
      "Rodape Rodape";
    @media #{$media-query-l} {
      // This is how you’d use design tokens with media queries
    }
  }
  .cx-1 {
    grid-area: Cabecalho;
  }
  .cx-2 {
    grid-area: Button;
  }
  .cx-3 {
    grid-area: Imagem;
  }
  .cx-4 {
    grid-area: Rodape;
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
