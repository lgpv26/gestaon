<template>
  <div class="rbc-status">
    <div
      class="rbc-status-item"
      v-for="(statusItem, index) in statusList"
      :key="index"
      :class="{ active: statusItem.value === value }"
      @click="onItemClick(statusItem)"
    >
      <span>{{ statusItem.text }}</span> <span class="push-both-sides"></span>
      <icon-check v-if="statusItem.value === value"></icon-check>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  props: ["card", "value"],
  data() {
    return {
      statusList: [
        {
          value: "pending",
          text: "Pendente"
        },
        {
          value: "in-displacement",
          text: "Em deslocamento"
        },
        {
          value: "canceled",
          text: "Cancelado"
        },
        {
          value: "finished",
          text: "Finalizado"
        }
      ]
    };
  },
  methods: {
    ...mapActions("request-board", ["removeCard"]),
    ...mapActions("request-queue", ["addToQueue"]),
    onItemClick(statusItem) {
      if (statusItem.value !== this.value) {
        this.changeValue(statusItem);
      }
    },
    changeValue(statusItem) {
      this.addToQueue({
        type: "request",
        op: "update-status",
        data: {
          requestId: this.card.requestId,
          status: statusItem.value
        }
      });
      this.$emit("change", statusItem.value);
      this.$emit("input", statusItem.value);
    }
  }
};
</script>

<style>
.rbc-status {
  width: 140px;
}
.rbc-status-item {
  display: flex;
  flex-direction: row;
  padding: 5px 8px;
  align-items: center;
  cursor: pointer;
}
.rbc-status-item span {
  color: var(--font-color--10);
  text-transform: uppercase;
}
.rbc-status-item.active span {
  color: var(--font-color--primary);
  text-transform: uppercase;
}
.rbc-status-item.active .colorizable {
  fill: var(--font-color--primary);
}
</style>
