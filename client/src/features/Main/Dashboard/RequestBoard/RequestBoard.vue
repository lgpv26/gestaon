<template>
  <div id="request-panel" ref="requestPanel">
    <div class="board">
      <app-request-board-section
        :options="boardOptions"
        :section="{ id: 'requests', name: 'Pedidos', size: 1 }"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters, mapActions } from "vuex";
import DraggableComponent from "vuedraggable";

import Vue from "vue";
import _ from "lodash";
import moment from "moment";
import shortid from "shortid";
import utils from "../../../../utils";
import { createHelpers } from "vuex-map-fields";

import RequestBoardSection from "./RequestBoardSection.vue";

const { mapFields } = createHelpers({
  getterType: "request-board/getField",
  mutationType: "request-board/updateField"
});

export default {
  components: {
    "app-draggable": DraggableComponent,
    "app-request-board-section": RequestBoardSection
  },
  data() {
    return {
      boardOptions: {
        columnWidth: 320,
        gutterSize: 10,
        headerHeight: 50,
        cardHeight: 112
      },
      sectionDraggableOptions: {
        handle: ".board-section__header",
        forceFallback: true
      },
      isDraggingSection: false,
      lastMove: {
        from: null,
        to: null
      }
    };
  },
  computed: {
    ...mapState(["mainContentArea"]),
    ...mapState("auth", ["user", "tokens", "company"]),
    ...mapState("morph-screen", { isShowingMorphScreen: "isShowing" }),
    ...mapState("request-board", ["sections"])
  },
  methods: {
    ...mapMutations("morph-screen", []),
    ...mapActions("request-board", {
      resetRequestBoardState: "resetState"
    })
  },
  created() {
    if (
      !_.has(this.sections, "requests.size") ||
      !_.has(this.sections, "scheduled.size")
    ) {
      this.resetRequestBoardState();
    }
  },
  mounted() {
    const vm = this;
    /*vm.$options.sockets['request-board:chat'] = (ev) => {
                if (ev.success) {
                    vm.updateCardUnreadChatItemCount({
                        cardId: ev.evData.cardId,
                        unreadChatItemCount: ev.evData.unreadChatItemCount
                    })
                }
                console.log("Received request-board:chat", ev)
            }
            vm.$options.sockets['request-queue:sync'] = (ev) => {
                console.log("Received request-queue:sync", ev)
            }*/
  }
};
</script>

<style>
#request-panel {
  display: flex;
  flex-direction: row;
  z-index: 999;
  height: 100%;
  pointer-events: none;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently */
}
#request-panel > .board {
  margin: 0 0 0 0;
  display: flex;
  flex-direction: row;
  height: 100%;
  pointer-events: initial;
}

#request-panel > .add-section {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0 0 10px;
  background-color: var(--bg-color);
  border-radius: 100%;
  box-shadow: var(--dial-button-shadow);
  cursor: pointer;
  pointer-events: initial;
}

#request-panel > .add-section:hover .colorizable {
  fill: var(--bg-color--primary);
}
</style>
