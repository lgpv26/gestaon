<template>
  <component :is="type" :href="href" :type="submit" :class="['button', size, state, variation]">
    <slot />
  </component>
</template>

<script>
/**
 * Buttons are generally used for interface actions. Suitable for all-purpose use.
 * Defaults to appearance that has white background with grey border.
 * Primary style should be used only once per view for main call-to-action.
 */
export default {
  name: "Button",
  status: "prototype",
  release: "3.5.0",
  props: {
    /**
     * The html element used for the button.
     * `button, a`
     */
    type: {
      type: String,
      default: "button",
      validator: value => {
        return value.match(/(button|a)/)
      },
    },
    /**
     * The size of the button. Defaults to medium.
     * `small, medium, large`
     */
    size: {
      type: String,
      default: "medium",
      validator: value => {
        return value.match(/(small|medium|large)/)
      },
    },
    /**
     * When setting the button’s type to a link, use this option to give a href.
     */
    href: {
      type: String,
      default: null,
    },
    /**
     * Set the button’s type to “submit”.
     */
    submit: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(null|submit)/)
      },
    },
    /**
     * Manually trigger various states of the button.
     * `hover, active, focus`
     */
    state: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(hover|active|focus)/)
      },
    },
    /**
     * Style variation to give additional meaning.
     * `primary, secondary`
     */
    variation: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(primary|secondary)/)
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.button {
  @include reset;
  @include stack-space($space-m);
  @include inline-space($space-xs);
  will-change: transform;
  transition: all 0.2s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: $weight-semi-bold;
  font-size: $size-m;
  font-family: $font-text;
  line-height: $line-height-m;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  box-shadow: inset 0 0 0 2px $color-primary;
  border-radius: $radius-default;
  background: transparent;
  color: $color-primary;
  cursor: pointer;
  &:hover,
  &.hover {
    color: $color-white;
    background: $color-primary;
    transform: translateZ(0) scale(1.03);
  }
  &:active,
  &.active {
    transition: none;
    background: $color-primary-70;
    box-shadow: none;
    color: $color-white;
    transform: translateZ(0) scale(1);
  }

  &:focus,
  &.focus {
    background: $color-primary-70;
    box-shadow: none;
    color: $color-white;
    transform: translateZ(0) scale(1);
    outline: 0;
  }

  // For icons inside buttons
  .icon {
    float: right;
    margin: -#{$space-xs} -#{$space-xs} -#{$space-s} $space-xs/2;
    color: $color-primary;
  }

  // Various button sizes
  &.x-large {
    @include inset-squish-space($space-s);
    font-size: $size-xxl;
  }
  &.large {
    @include inset-squish-space($space-s);
    font-size: $size-l;
  }
  &.medium {
    @include inset-squish-space($space-s);
    font-size: $size-m;
  }
  &.small {
    @include inset-squish-space($space-xs);
    font-size: $size-s;
  }

  // Primary button
  &.primary {
    background: $color-primary;
    color: $color-white;
    box-shadow: none;
    &:hover,
    &.hover {
      background-color: shade($color-primary, 12%);
    }
    &:active,
    &.active {
      background-color: shade($color-primary, 20%);
      transition: none;
    }
    &:focus {
      outline: 0;
    }
  }

  // Accent button
  &.accent {
    background: $color-accent-3;
    color: $color-white;
    box-shadow: none;
    border-radius: 5px;
    &:hover,
    &.hover {
      background-color: shade($color-accent-3, 10%);
    }
    &:active,
    &.active {
      background-color: shade($color-accent-3, 20%);
      transition: none;
    }
    &:focus {
      outline: 0;
    }
  }
}
</style>

<docs>
  ```jsx
  <div>
    <Button variation="primary" size="large">Primary Button</Button>
    <Button variation="accent" size="large">Accent Button</Button>
    <Button variation="primary" size="medium">Medium</Button>
    <Button variation="primary" size="small">Small</Button>
    <Button variation="accent" size="small">Small</Button>
    <br />
    <Button>Default Button</Button>
    <Button state="hover">:hover</Button>
    <Button state="active">:active</Button>
    <Button state="focus">:focus</Button>
  </div>
  ```
</docs>
