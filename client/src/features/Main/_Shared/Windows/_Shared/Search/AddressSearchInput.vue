<template>
  <div>
    <input
      type="text"
      class="input"
      style="margin-bottom: 0; text-transform: uppercase"
      :value="value"
      :disabled="isEditing"
      :class="{ readonly: isEditing }"
      v-if="isEditing"
    />
    <app-popover
      ref="popover"
      :placement="'bottom-start'"
      :forceVisible="false"
      :useScroll="true"
      :contentPadding="false"
      :horizontalOffset="-15"
      :verticalOffset="3"
      v-else
    >
      <template slot="triggerer">
        <input
          type="text"
          class="input"
          style="margin-bottom: 0; text-transform: uppercase"
          :value="value"
          @click="isInputFocused = true"
          @focus="focus()"
          @blur="isInputFocused = false"
          @input="input($event)"
        />
      </template>
      <template slot="content">
        <div class="result__container">
          <div
            v-for="item in items"
            :key="item.id"
            @click="select(item)"
            class="result-item__container"
          >
            <span class="address"> {{ item.name }} </span>
            <span class="address-details">
              {{ item.neighborhood ? item.neighborhood : "SEM BAIRRO" }} -
              {{ item.city }}/{{ item.state }}
            </span>
          </div>
        </div>
      </template>
    </app-popover>
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from "vuex";
import _ from "lodash";

export default {
  props: ["value", "address"],
  components: {},
  data() {
    return {
      isInputFocused: false,
      items: []
    };
  },
  computed: {
    isEditing() {
      return Number.isInteger(this.address.id);
    }
  },
  methods: {
    focus() {
      this.isInputFocused = true;
      this.$refs.popover.update();
    },
    input(ev) {
      if (this.$static.searchAddressesIndex) {
        let resultData = this.$static.searchAddressesIndex
          .search(ev.target.value, {
            fields: {
              name: {
                boost: 1
              }
            },
            bool: "OR",
            expand: false
          })
          .slice(0, 30);
        this.$db.searchAddresses
          .where("id")
          .anyOf(
            _.map(resultData, resultDataItem => {
              return parseInt(resultDataItem.ref);
            })
          )
          .toArray()
          .then(foundAddresses => {
            this.items = _.map(resultData, resultDataItem => {
              return _.find(foundAddresses, {
                id: parseInt(resultDataItem.ref)
              });
            });
          });
      }
      this.$emit("input", ev.target.value);
    },
    select(address) {
      this.$refs.popover.closePopover();
      this.$emit("input", address.name);
      this.$emit("select", address);
    }
  },
  mounted() {}
};
</script>

<style lang="scss">
.result__container {
  .result-item__container {
    display: flex;
    flex-direction: column;
    width: 475px;
    padding: 12px 15px;
    border-bottom: 1px solid var(--border-color--0);
    cursor: pointer;
    &:last-child {
      border-bottom: 0;
    }
    &:hover {
      background-color: var(--bg-color--3);
    }
    .name {
      color: var(--font-color--primary);
      margin-bottom: 5px;
    }
  }
}
</style>
