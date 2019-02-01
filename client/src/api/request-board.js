import Vue from "vue";
import config from "../config";

export default {
  getRequests(params = {}) {
    return Vue.http
      .get(config.apiBaseUrl + "/request-board", { params })
      .then(response => response.json());
  }
};
