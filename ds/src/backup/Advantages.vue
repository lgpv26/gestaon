<template>
  <component :is="type" class="image">
    <div class="conteiner row">
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
        <Heading level="h3" class="Head">Lorem Ipsum <b class="b">sit amet orem</b></Heading>
        <div class="cx-1">
          <Paragraph class="paragraph" textAlign="justify"
            >Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat, dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat</Paragraph
          >
        </div>

        <div class="cx-2 row">
          <div
            class="
                    row start-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
            style="
                    display:flex;
                    align-items: center;"
          >
            <img src="../assets/adv-icon.png" />
            <Heading class="font">Lorem ipsum sit</Heading>
          </div>
          <div
            class="
                    row end-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
            style="
                    display:flex;
                    align-items:center;"
          >
            <img src="../assets/adv-icon.png" />
            <Heading class="font">Lorem ipsum sit</Heading>
          </div>
          <div
            class="cx-3
                    row start-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
            style="
                    display:flex;
                    align-items:center;"
          >
            <img src="../assets/adv-icon.png" />
            <Heading class="font">Lorem ipsum sit</Heading>
          </div>
          <div
            class="cx-3
                    row end-xs
                    col-xs-12
                    col-sm-12
                    col-md-12
                    col-lg-6"
            style="
                    display:flex;
                    align-items:center;"
          >
            <img src="../assets/adv-icon.png" />
            <Heading class="font">Lorem ipsum sit</Heading>
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
@import url("https://fonts.googleapis.com/css?family=Montserrat+Alternates");
@import url("https://fonts.googleapis.com/css?family=Montserrat");
.paragraph {
  margin-bottom: 20px !important;
  color: #276e73;
  font-family: Montserrat Alternates;
  padding: 0px 110px 0px 10px;
}
.Head {
  color: #276e73;
  font-family: Montserrat Alternates;
  font-size: 32px;
}
.b {
  color: rgb(30, 79, 83);
  font-weight: bold;
}
.cx-1 {
  margin: 0px;
}
.button {
  margin-top: 20px;
  margin-right: 110px;
}
.conteiner {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 80px 40px 0px 40px;
}
.cx-2 {
  margin: 0px;
  padding: 0px 80px 0px 10px;
}
.cx-3 {
  margin-top: 20px;
}
.font {
  font-size: 16px;
  font-family: Montserrat Alternates;
  margin-left: 10px;
  color: #276e73;
}
.box {
  padding: 40px 0px 0px 40px;
}
.box img {
  width: 90%;
}
</style>

<docs>
  ```jsx
  <Advantages />
  ```
</docs>
