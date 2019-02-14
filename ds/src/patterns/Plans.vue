<template>
  <div class="Plans">
    <div class="v7"><img src="../assets/Vector7.png" /></div>
    <div class="v8"><img src="../assets/Vector8.png" /></div>
    <div class="tx">
      <h3>Nossos Planos</h3>
      <p>
        We believe we have created the most efficient SaaS landing page for your users<br />
        Landing page with features that will convince you to use it for your SaaS business
      </p>
    </div>
    <div class="row col-md-12 cx-1">
      <div class="col-md-3 cx-2">
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
      </div>
      <div class="col-md-3 cx-2">
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
      </div>
      <div class="col-md-3 cx-2">
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
        <Icon size="small" name="Vector" class="icon" />
        <h3 class="Paragraph2">SaaS landing page</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Plans",
  status: "ready",
  release: "1.0.0",
  model: {
    prop: "active",
  },
  data() {
    return {
      type: "monthly",
    }
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

.Plans {
  margin: 0px auto -20px auto;
  max-width: 1245px;
  position: relative;
  background: #23272b;
  height: 800px;
}
.v7 {
  position: absolute;
  top: 0px;
}
.v7 img {
  width: 100%;
}
.v8 {
  position: absolute;
  top: 0px;
}
.v8 img {
  width: 100%;
}
.tx {
  text-align: center;
  padding-top: 50px;
}
.tx h3 {
  color: #ffffff;
}
.tx p {
  color: rgb(218, 214, 214);
}
.cx-1 {
  padding: 0px 200px 0px 200px;
  margin: 100px 0px 20px 120px;
}
.cx-2 {
  background: white;
  margin: 0px 10px 0px 10px;
}
</style>

<docs>
  ```jsx
  <Plans />
  ```
</docs>
