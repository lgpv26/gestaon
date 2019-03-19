import _ from 'lodash';

export const setApp = (state, app) => {
    state.app = _.assign({}, state.app, app);
};

export const setAppTitle = (state, appTitle) => {
  state.app.title = appTitle;
};

export const SET_SYSTEM_REQUESTS_LOADED = (state, requestsLoaded) => {
    state.system.requestsLoaded = requestsLoaded;
};

export const setSystemInitialized = (state, initialized) => {
    state.system.initialized = initialized;
};

export const setMainContentArea = (state, mainContentArea) => {
    state.mainContentArea = mainContentArea;
};

export const SET_APP_VERSION = (state, version) => {
    state.app.version = version
};

export const SET_WINDOW_DIMENSIONS = (state, { width = 0, height = 0 }) => {
    state.dimensions.window.width = width
    state.dimensions.window.height = height
};

export const SET_LAST_DATA_SYNCED_DATE = (state, date) => {
    state.lastDataSyncedDate = date
};

export const SET_LAST_REQUESTS_LOADED_DATE = (state, date) => {
    state.lastRequestsLoadedDate = date
};