<template>
  <div id="app">
    <!-- loading -->
    <app-loading></app-loading>
    <div id="router-view">
      <!-- routes -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Dexie from "dexie";
import store from "./vuex/store";
import shortid from "shortid";
import { mapState, mapMutations, mapActions } from "vuex";
import moment from "moment";
import LoadingComponent from "./components/Utilities/Loading.vue";
import { version } from "../package.json";
import RequestBoardAPI from "./api/request-board";

import Card from "./vuex/models/Card";
import Request from "./vuex/models/Request";

export default {
  store,
  components: {
    "app-loading": LoadingComponent
  },
  data: function() {
    return {};
  },
  computed: {
    ...mapState(["app", "dimensions"])
  },
  methods: {
    ...mapMutations(["SET_WINDOW_DIMENSIONS", "SET_APP_VERSION"]),
    setWindowDimensions() {
      this.SET_WINDOW_DIMENSIONS({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      });
    }
  },
  created() {
    const vm = this;
    this.SET_APP_VERSION(version);
    Vue.prototype.$db = new Dexie("db");
    this.$db.version(1).stores({
      ...this.modelDefinitions.searchModels,
      ...this.modelDefinitions.offlineDBModels,
      ...this.modelDefinitions.stateModels
    });
    this.$store.subscribe((mutation, state) => {
      if (
        mutation.type.includes("entities") &&
        !_.get(mutation.payload, "ignoreOfflineDBInsertion", false) &&
        _.has(mutation, "payload.entity") &&
        _.has(vm.$db, "STATE_" + mutation.payload.entity)
      ) {
        const entityAction = mutation.type.replace("entities/", "");
        if (entityAction === "delete") {
          vm.$db["STATE_" + mutation.payload.entity].delete(
            mutation.payload.where
          );
          return true;
        }
        vm.$db["STATE_" + mutation.payload.entity].bulkPut(
          mutation.payload.result.data[mutation.payload.entity]
        );
      }
    });

    const promises = [];
    _.forOwn(this.modelDefinitions.stateModels, (fields, stateModelName) => {
      const modelName = stateModelName.replace("STATE_", "");
      promises.push(
        vm.$db[stateModelName].toArray().then(data => {
          vm.$store.dispatch("entities/create", {
            entity: modelName,
            data: data,
            ignoreOfflineDBInsertion: true
          });
          return data;
        })
      );
    });
    Promise.all(promises).then(() => {
      RequestBoardAPI.getRequests({
        date: moment().toISOString()
      }).then(response => {
        console.log("After Request Board API request", response);
        response.data.forEach(request => {
          const requestId = _.get(request, "tmpId", request.id);
          const cards = Card.query()
            .where("requestId", requestId)
            .with("request.requestUIState")
            .get();
          const card = _.first(cards);
          let windowTmpId = `tmp/${shortid.generate()}`;
          let cardTmpId = `tmp/${shortid.generate()}`;
          let requestUIStateTmpId = `tmp/${shortid.generate()}`;
          if (!Number.isInteger(requestId) && card) {
            // remove previous card/request/
            vm.$store.dispatch("entities/cards/delete", card.id);
            vm.$store.dispatch("entities/windows/delete", card.windowId);
            vm.$store.dispatch("entities/requests/delete", card.requestId);
            vm.$store.dispatch(
              "entities/requestUIState/delete",
              card.request.requestUIState.id
            );
          } else if (card) {
            windowTmpId = card.windowId;
            cardTmpId = card.id;
            requestUIStateTmpId = card.request.requestUIState.id;
          }
          vm.$store.dispatch("entities/requests/insertOrUpdate", {
            data: request
          });
          vm.$store.dispatch("entities/windows/insert", {
            data: {
              id: windowTmpId,
              zIndex:
                vm.$store.getters["entities/windows/query"]().max("zIndex") + 1,
              show: false
            }
          });
          vm.$store.dispatch("entities/cards/insert", {
            data: {
              id: cardTmpId,
              windowId: windowTmpId,
              requestId: request.id
            }
          });
          vm.$store.dispatch("entities/requestUIState/insert", {
            data: {
              id: requestUIStateTmpId,
              windowId: windowTmpId,
              requestId: request.id
            }
          });
          vm.$store.dispatch("entities/requestPayments/insertOrUpdate", {
            data: request.requestPayments
          });
          vm.$store.dispatch("entities/requestOrders/insertOrUpdate", {
            data: request.requestOrder
          });
          vm.$store.dispatch("entities/requestOrderProducts/insertOrUpdate", {
            data: request.requestOrder.requestOrderProducts
          });
          vm.$store.dispatch("entities/clients/insertOrUpdate", {
            data: request.client
          });
          request.client.clientAddresses.forEach(clientAddress => {
            vm.$store.dispatch("entities/addresses/insertOrUpdate", {
              data: clientAddress.address
            });
          });
          vm.$store.dispatch("entities/clientAddresses/insertOrUpdate", {
            data: request.client.clientAddresses
          });
          vm.$store.dispatch("entities/requestClientAddresses/insertOrUpdate", {
            data: request.requestClientAddresses
          });

          const savedRequest = Request.query()
            .with("card")
            .with("client")
            .with("requestOrder.requestOrderProducts")
            .find(request.id);

          Card.update({
            where: savedRequest.card.id,
            data: {
              clientName: savedRequest.client.name,
              orderSubtotal: _.sumBy(
                savedRequest.requestOrder.requestOrderProducts,
                requestOrderProduct => {
                  return (
                    requestOrderProduct.quantity *
                    (requestOrderProduct.unitPrice -
                      requestOrderProduct.unitDiscount)
                  );
                }
              )
            }
          });
        });
      });
    });
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.setWindowDimensions);
      this.setWindowDimensions();
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.setWindowDimensions);
  }
};
</script>

<style lang="scss"></style>
