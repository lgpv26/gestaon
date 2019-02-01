<template>
  <div class="rbc-status">
    <div
      class="rbc-status-item"
      v-for="(userItem, index) in selectUsers"
      :key="index"
      :class="{ active: userItem.value === value }"
      @click="onItemClick(userItem)"
    >
      <span>{{ userItem.text }}</span> <span class="push-both-sides"></span>
      <icon-check v-if="userItem.value === value"></icon-check>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import User from "../../../../../vuex/models/User";
export default {
  props: ["card", "value"],
  data() {
    return {
      userList: []
    };
  },
  computed: {
    selectUsers() {
      return _.map(User.all(), user => {
        return {
          value: user.id,
          text: user.name
        };
      });
    }
  },
  methods: {
    ...mapActions("request-queue", ["addToQueue"]),
    onItemClick(userItem) {
      if (userItem.value !== this.value) {
        this.changeValue(userItem);
      }
    },
    changeValue(userItem) {
      this.addToQueue({
        type: "request",
        op: "update-user",
        data: {
          requestId: this.card.requestId,
          userId: userItem.value
        }
      });
      this.$emit("change", userItem.value);
      this.$emit("input", userItem.value);
    }
  }
};
</script>

<style>
.rbc-status {
  width: 180px;
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
