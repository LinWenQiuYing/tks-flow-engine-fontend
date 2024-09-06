import { createStore } from "vuex";

export default createStore({
  state: {
    flowDetails: {},
  },
  mutations: {
    setFlowDetails(state, value) {
      state.flowDetails = value;
    },
  },
  actions: {},
  modules: {},
});
