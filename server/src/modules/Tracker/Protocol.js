import config from "../../config/index";
import _ from "lodash";
import moment from "moment";
import net from "net";
import restify from "restify";
import corsMiddleware from "restify-cors-middleware";

const log = new require("pretty-logger")();

module.exports = class PROTOCOL {
  constructor(server, protocol) {
    this.server = server;
    this.protocol = protocol;

    this.protocolServer = null;
  }

  createServer() {
    return new Promise(async (resolve, reject) => {
      if (!this.protocol)
        return reject(
          "Não foi possivel iniciar o servidor do protocolo de rastreamento"
        );

      if (_.includes(["osmand", "gestaon"], this.protocol.name)) {
        await this.restifyServer();
        resolve();
      } else {
        await this.netServer();
        resolve();
      }
    });
  }

  netServer() {
    return new Promise(async (resolve, reject) => {
      this.protocolServer = await net.createServer();
      await this.protocolServer.listen(this.protocol.port);

      log.info(
        this.protocol.name.toUpperCase() +
          " listening on port: " +
          this.protocol.port
      );
      resolve();
    });
  }

  restifyServer() {
    return new Promise(async (resolve, reject) => {
      // create restify server
      this.protocolServer = restify.createServer({
        name: this.protocol.name
      });

      /* configure cors */
      const cors = corsMiddleware({
        origins: ["*"],
        allowHeaders: ["X-Requested-With", "Authorization", "Content-type"]
      });

      this.protocolServer.pre(cors.preflight);
      this.protocolServer.use(cors.actual);

      /* configuring restify plugins */
      this.protocolServer.use(
        restify.plugins.acceptParser(this.protocolServer.acceptable)
      );
      this.protocolServer.use(restify.plugins.queryParser());
      this.protocolServer.use(restify.plugins.bodyParser());
      this.protocolServer.use(restify.plugins.gzipResponse());

      await this.protocolServer.listen(this.protocol.port);

      log.info(
        this.protocol.name.toUpperCase() +
          " listening on port: " +
          this.protocol.port
      );

      resolve();
    });
  }

  getProtocolServer() {
    return this.protocolServer;
  }

  bufferDecode(data) {
    return Promise.resolve(data.toString());
  }

  connectionListen() {
    return this.connection.on("data", data => {
      data = this.bufferDecode(data);
      console.log(data);
    });
  }

  savePosition(data) {
    return this.server.broker.call("data/position.create", {
      data
    });
  }

  broadcast(position, device) {
    return new Promise(async (resolve, reject) => {
      try {
        this.server.io
          .in("company/" + device.companyId)
          .emit("tracker:position", position);
        return resolve();
      } catch (err) {
        return reject("Erro ao enviar evento!");
      }
    });
  }
};
