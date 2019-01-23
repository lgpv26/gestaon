import _ from "lodash";
import { getField, updateField } from "vuex-map-fields";
import {
  RequestBoardCardModel,
  RequestBoardSectionModel
} from "../../models/index";
import utils from "../../utils";

const initialState = () => ({
  sections: {
    requests: {
      size: 1
    },
    scheduled: {
      size: 1
    }
  },
  filters: {
    deliveryDate: new Date()
  }
});

const state = initialState;

const getters = {
  getField
};

const mutations = {
  EXPAND_SECTION(state, sectionId) {
    if (_.get(state, `sections[${sectionId}].size`, false)) {
      state.sections[sectionId].size += 1;
    } else {
      state.sections[sectionId].size = 1;
    }
  },
  COLLAPSE_SECTION(state, sectionId) {
    if (_.get(state, `sections[${sectionId}].size`, false)) {
      if (state.sections[sectionId].size === 1) {
        state.sections[sectionId].size = 1;
      } else {
        state.sections[sectionId].size -= 1;
      }
    } else {
      state.sections[sectionId].size = 1;
    }
  },
  RESET_STATE(state) {
    const initial = initialState();
    Object.keys(initial).forEach(key => {
      state[key] = initial[key];
    });
  },
  updateField
};

const actions = {
  expandSection(context, sectionId) {
    context.commit("EXPAND_SECTION", sectionId);
  },
  collapseSection(context, sectionId) {
    context.commit("COLLAPSE_SECTION", sectionId);
  },
  resetState(context) {
    context.commit("RESET_STATE");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
