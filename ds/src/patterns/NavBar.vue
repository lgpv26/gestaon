<template>
  <Wrapper class="Wrapper1 row col-xs-12">
    <Wrapper class="cx col-xs-2">
      <img
        src="https://lh6.googleusercontent.com/iAFNZ3UbXyVWgUhVWbtBFkgousIF3Xu2XliUiKAdjN6HhMgG9dNpeawJQcxhqhJxdjU_86rDpHrGHw=w1366-h657"
      />
    </Wrapper>
    <Wrapper class="cx col-xs">
      <nav class="nav">
        <a
          v-for="(item, index) in navItems"
          :key="index"
          :href="item.href"
          :class="[{ active: localActive === item.component }, item.class]"
          v-html="item.name"
        />
      </nav>
    </Wrapper>
    <Wrapper class="Wrapper1 col-xs-2">
      <Button class="button1" variation="accent" size="small">Demonstração</Button>
    </Wrapper>
  </Wrapper>
</template>

<script>
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "NavBar",
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
    /**
     * State which tab is active when initiated (using name of the component).
     */
    active: {
      required: true,
      type: String,
    },
    /**
     * Menu items to be displayed on the nav bar.
     */
    navItems: {
      required: true,
      type: Array,
    },
  },
  computed: {
    localActive: {
      get() {
        return this.active
      },
      set(val) {
        this.$emit("input", val)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../node_modules/flexboxgrid/dist/flexboxgrid.min.css";
// Design Tokens with local scope
.Wrapper1 {
  margin: 0px;
  padding: 5px;
}
.cx {
  margin: 0px;
  padding: 15px;
}
.nav {
  float: right;
}
a {
  margin-left: 24px;
  text-decoration: none;
  color: $color-primary-40;
  font-size: 18px;
}
a:hover {
  color: $color-primary-60;
}
.button1 {
  width: 150px;
  height: 45px;
  font-size: 18px;
}
</style>

<docs>
  ```jsx
  <NavBar />
  ```
</docs>
