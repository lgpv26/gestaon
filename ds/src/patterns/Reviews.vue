<script>
/**
 * Used as main page navigation in templates.
 */
export default {
  name: "Reviews",
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
