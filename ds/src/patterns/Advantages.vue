<template>
  <component :is="type" class="image">
    <div class="row">
      <div
        class="
        row start-xs
        center-md
        center-sm
        start-lg
        col-xs-12
        col-sm-12
        col-md-12
        col-lg-6"
      >
        <div class="box"><img :src="advantageImg" class="logo" /></div>
      </div>
      <div
        class="
        center-md
        center-sm
        end-lg
        col-xs-12
        col-sm-12
        col-md-12
        col-lg-6"
      >
        <Heading level="h3">Lorem Ipsum sit amet orem</Heading>
        <div>
          <Paragraph class="paragraph" textAlign="justify"
            >Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat</Paragraph
          >
        </div>

        <div class="row">
          <div
            class="
                    row start-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
          >
            <Heading level="h5">Lorem ipsum sit</Heading>
          </div>
          <div
            class="
                    row end-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
          >
            <Heading level="h5">Lorem ipsum sit</Heading>
          </div>
          <div
            class="
                    row start-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
          >
            <Heading level="h5">Lorem ipsum sit</Heading>
          </div>
          <div
            class="
                    row end-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
          >
            <Heading level="h5">Lorem ipsum sit</Heading>
          </div>
        </div>
        <div
          class="row end-xs
                        button"
        >
          <Button variation="primary" size="medium" style="width: 35%;">Saber Mais</Button>
        </div>
      </div>
    </div>
  </component>
</template>

<script>
/**
 * Shows how to layout and structure a home page.
 */
export default {
  name: "Advantages",
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
  data() {
    return {
      advantageImg: require("../assets/advantage-imagearts.png"),
    }
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
.paragraph {
  margin-bottom: 20px !important;
}
.button {
  margin-top: 20px;
}
</style>

<docs>
  ```jsx
  <Advantages />
  ```
</docs>
