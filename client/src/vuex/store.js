import Vue from 'vue'
import Vuex from 'vuex'
import * as mutations from './mutations'
import * as actions from './actions'
import modules from './modules'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    app: {
      title: "ERP",
      header: "request-board"
    },
    system: {
      initialized: false
    },
    mainContentArea: {
      height: 0,
      width: 0
    }
  },
  mutations,
  actions,
  modules,
  strict: true
})
