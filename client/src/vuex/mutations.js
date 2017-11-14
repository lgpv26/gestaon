export const setAppTitle = (state, appTitle) => {
  state.app.title = appTitle;
};

export const setSystemInitialized = (state, initialized) => {
    state.system.initialized = initialized;
};

export const setMainContentArea = (state, mainContentArea) => {
    state.mainContentArea = mainContentArea;
};
