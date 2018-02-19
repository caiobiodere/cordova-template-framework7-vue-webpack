import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {}
  },

  actions: {
    userLogged ({commit}, user) {
      commit('USER_LOGGED', user)
    }
  },

  mutations: {
    USER_LOGGED (state, user) {
      state.user = user
    }
  },
});