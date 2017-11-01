import Vue from 'vue'
import Vuex from 'vuex'
import * as mutations from './mutations'
import * as actions from './actions'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    app: {
      title: "Elomax Client"
    },
    system: {
      initialized: false
    }
  },
  mutations,
  actions,
  modules,
  strict: true
})
