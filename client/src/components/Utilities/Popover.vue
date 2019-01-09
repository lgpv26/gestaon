<template>
  <div
    :class="'popover-component popover-group--' + group"
    :data-open="visible"
    :data-group-level="groupLevel"
  >
    <div
      ref="content"
      v-if="!useScroll"
      :style="[contentDefaultStyle, contentStyle]"
      class="popover-content popover-shadow"
      :class="{
        hidden: !visible && !forceVisible,
        'content-padding': contentPadding
      }"
      @mouseover="onMouseOver($event)"
      @mouseleave="onMouseLeave($event)"
    >
      <slot name="content"></slot>
    </div>
    <div
      ref="content"
      v-else
      :style="[contentDefaultStyle, contentStyle]"
      style="max-height: 280px;"
      class="popover-content popover-shadow"
      :class="{ hidden: !visible && !forceVisible }"
      @mouseover="onMouseOver($event)"
      @mouseleave="onMouseLeave($event)"
    >
      <div :class="{ 'content-padding': contentPadding }">
        <slot name="content"></slot>
      </div>
    </div>
    <div
      ref="triggerer"
      :style="[triggererDefaultStyle, triggererStyle]"
      class="popover-triggerer"
      @mousedown="onTriggererClick()"
      @mouseover="onMouseOver($event)"
      @mouseleave="onMouseLeave($event)"
    >
      <slot name="triggerer"> </slot>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import Scrollbar from "smooth-scrollbar";
import Popper from "popper.js";
import Vue from "vue";

export default {
  props: {
    group: {
      default: "x",
      type: String
    },
    groupLevel: {
      default: 0,
      type: Number
    },
    placement: {
      default: "bottom",
      type: String
    },
    useScroll: {
      default: false,
      type: Boolean
    },
    forceVisible: {
      default: false,
      type: Boolean
    },
    trigger: {
      default: "click",
      type: String
    },
    contentStyle: {
      default: () => {
        return {};
      },
      type: Object
    },
    triggererStyle: {
      default: () => {
        return {};
      },
      type: Object
    },
    verticalOffset: {
      default: 0,
      type: Number
    },
    horizontalOffset: {
      default: 0,
      type: Number
    },
    contentPadding: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      triggererDefaultStyle: {},
      contentDefaultStyle: {
        position: "absolute",
        zIndex: 99999999,
        backgroundColor: "var(--bg-color--2)",
        borderRadius: "5px"
      },
      scrollbar: null,
      visible: false,
      leaveTimeout: null,
      popper: null
    };
  },
  methods: {
    update() {
      this.popper.scheduleUpdate();
    },
    onMouseOver(ev) {
      if (this.leaveTimeout) {
        clearTimeout(this.leaveTimeout);
      }
      if (
        !this.visible &&
        (ev.target === this.$refs.triggerer ||
          this.$refs.triggerer.contains(ev.target)) &&
        this.trigger === "mouseover"
      ) {
        this.openPopover();
      }
    },
    onMouseLeave(ev) {
      if (
        ev.target === this.$refs.triggerer ||
        this.$refs.triggerer.contains(ev.target) ||
        (ev.target === this.$refs.content ||
          this.$refs.content.contains(ev.target))
      ) {
        this.leaveTimeout = setTimeout(() => {
          this.closePopover();
        }, 1000);
      }
    },
    onTriggererClick() {
      const contents = document.querySelectorAll("div.popover-content");
      _.forEach(contents, content => {
        if (content === this.$refs.content) {
          content.style.zIndex = 99999999;
        } else {
          content.style.zIndex = 99999998;
        }
      });
      this.openPopover();
    },
    onBodyClick(ev) {
      // verify if the user is not clicking the triggerer with the popup opened
      if (
        this.visible &&
        (this.$refs.triggerer.contains(ev.target) ||
          this.$refs.triggerer === ev.target)
      ) {
        // do nothing
      }
      // verify if the user is clicking outside the triggerer and content area
      else if (
        this.visible &&
        this.$refs.content &&
        (this.$refs.content !== ev.target &&
          !this.$refs.content.contains(ev.target))
      ) {
        this.closePopover();
      }
    },
    openPopover() {
      this.visible = true;
      this.$emit("open", true);
      this.popper.scheduleUpdate();
    },
    closePopover() {
      // check if there is popovers in higher hierarchy, so it can't close
      const els = document.getElementsByClassName(
        "popover-group--" + this.group
      );
      const higherLevels = _.filter(els, el => {
        return (
          parseInt(el.getAttribute("data-group-level")) > this.groupLevel &&
          !!el.getAttribute("data-open")
        );
      });
      if (!higherLevels.length) {
        this.visible = false;
      }
    },
    attachContentToBody() {
      document.body.appendChild(this.$refs.content);
    },
    attachPopper() {
      this.destroyPopper();
      this.popper = new Popper(this.$refs.triggerer, this.$refs.content, {
        placement: this.placement,
        modifiers: {
          flip: {
            enabled: true
          },
          offset: {
            offset: this.horizontalOffset + "," + this.verticalOffset
          }
        }
      });
    },
    destroyPopper() {
      if (this.popper) {
        this.popper.destroy();
      }
    }
  },
  mounted() {
    this.attachContentToBody();
    this.attachPopper();
    document.addEventListener("mousedown", this.onBodyClick);
    if (this.useScroll) {
      this.scrollbar = Scrollbar.init(this.$refs.content, {
        overscrollEffect: "bounce",
        alwaysShowTracks: true
      });
    }
  },
  beforeDestroy() {
    if (this.scrollbar) this.scrollbar.destroy();
    this.destroyPopper();
    this.$refs.content.parentNode.removeChild(this.$refs.content);
    document.removeEventListener("mousedown", this.onBodyClick);
  }
};
</script>

<style scoped>
.popover-triggerer {
  height: 100%;
  display: flex;
  align-items: center;
}
.hidden {
  display: none;
}
.visible {
  display: block !important;
}

.content-padding {
  padding: 12px 15px;
}
</style>
