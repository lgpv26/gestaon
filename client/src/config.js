import _ from "lodash";

let config = {
  apiBaseUrl: "http://localhost:8080",
  socketServer: "http://localhost:8080",
  system: {
    // don't change settings under this object if you don't know what you're doing
    IDMappings: {
      paymentMethods: {
        default: 1,
        bill: 4
      },
      products: {
        default: 1
      }
    }
  }
};

if (process.env.NODE_ENV !== "production") {
  try {
    const developerConfig = require("./config.developer").default;
    _.assign(config, developerConfig);
    // do stuff
  } catch (err) {
    console.log("Developer config file not found.", err);
  }
}

export default config;
