import _ from "lodash";

const state = {
  requestStatusList: [
    {
      id: 1,
      value: "pending",
      name: "PENDENTE"
    },
    {
      id: 2,
      value: "finished",
      name: "FINALIZADO"
    },
    {
      id: 3,
      value: "canceled",
      name: "CANCELADO"
    },
    {
      id: 4,
      value: "in-displacement",
      name: "EM DESLOCAMENTO"
    },
    {
      id: 5,
      value: "draft",
      name: "RASCUNHO"
    }
  ]
};

const getters = {
  requestStatusListSelectItems(state) {
    return _.map(state.requestStatusList, requestStatus => {
      return {
        value: requestStatus.value,
        text: requestStatus.name
      };
    });
  }
};

const mutations = {};

const actions = {};

export default {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
};
