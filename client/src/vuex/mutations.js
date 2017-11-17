import _ from 'lodash';

export const setApp = (state, app) => {
    state.app = _.assign({}, state.app, app);
};

export const setAppTitle = (state, appTitle) => {
  state.app.title = appTitle;
};

export const setSystemInitialized = (state, initialized) => {
    state.system.initialized = initialized;
};

export const setMainContentArea = (state, mainContentArea) => {
    state.mainContentArea = mainContentArea;
};
