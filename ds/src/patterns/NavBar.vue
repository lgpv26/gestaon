<template>
  <component :is="type" class="header">
    <div class="conteiner row">
      <div
        class="   row start-xs
                  center-xs
                  center-md
                  center-sm
                  start-lg
                  col-xs-12
                  col-sm-12
                  col-md-12
                  col-lg-6"
      >
        <div class="box"><img :src="logo" class="logo" /></div>
      </div>
      <div
        class="center-xs
                  center-md
                  center-sm
                  end-lg
                  col-xs-12
                  col-sm-12
                  col-md-12
                  col-lg-4"
      >
        <div class="box">
          <nav class="nav">
            <a
              v-for="(item, index) in navItems"
              :key="index"
              :href="item.href"
              :class="[{ active: localActive === item.component }, item.class]"
              v-html="item.name"
            />
          </nav>
        </div>
      </div>
      <div
        class="center-xs
                  center-md
                  center-sm
                  end-lg
                  col-xs-12
                  col-sm-12
                  col-md-12
                  col-lg-2"
        style="display: flex;"
      >
        <div style="width: 100%; display: flex; align-items: center;">
          <button style="width: 100%;" class="button1">Demonstração</button>
        </div>
      </div>
    </div>
  </component>
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
  data() {
    return {
      logo: require("../assets/logo.png"),
    }
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
@import "../../src/assets/fonts/montserrat.css";

// Design Tokens with local scope
$color-nav-link: $color-primary;
$color-nav-link-active: $color-primary;

.nav {
  @include stack-space($space-m);
  font-family: $font-text;
  font-size: $size-s;
  line-height: $line-height-m;
  color: $color-white;
  width: 100%;
  margin-bottom: 0;
  @media #{$media-query-l} {
    // This is how you’d use design tokens with media queries
  }
  a {
    color: #ffffff;
    padding: $space-m 0;
    margin: 0 $space-m;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
  }
}
a {
  margin-left: 20px;
  padding: 0px 0px 0px 0px;
  text-decoration: none;
  color: $color-primary-40;
  font-weight: 600px;
}
a:hover {
  color: $color-primary-60;
}
.button1 {
  width: 150px;
  height: 50px;
  font-size: 12px;
  border: 0px;
  border-radius: 5px;
  color: white;
  background: linear-gradient(214.41deg, #49dfea -10.02%, #0072e4 91.15%);
  font-weight: 600;
  font-family: Montserrat;
}
.conteiner {
  max-width: 1245px;
  margin-left: auto;
  margin-right: auto;
  padding: 5px 40px 5px 200px;
  background: black;
}
.logo {
  padding: 10px;
}
</style>

<docs>
  ```jsx
  <NavBar active="Home" :navItems="[
    {name: 'Home', component: 'Home', href: '/example/', class: 'home'},
    {name: 'Recursos', component: 'Recursos', href: '/example/', class: 'resource'},
    {name: 'Dúvidas', component: 'Dúvidas', href: '/example/', class: 'questions'},
  ]"/>
  ```
</docs>
