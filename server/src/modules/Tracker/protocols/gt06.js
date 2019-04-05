import Protocol from "../Protocol";
import _ from "lodash";
import moment from "moment";

module.exports = class GT06 extends Protocol {
  constructor(server, protocol) {
    super(server, protocol);

    this.server = server;
    this.protocol = protocol;

    this.protocolServer = null;
  }

  init() {
    return new Promise(async (resolve, reject) => {
      await super.createServer();
      this.connectionListen();

      resolve();
    });
  }

  connectionListen() {
    this.protocolServer = super.getProtocolServer();

    this.protocolServer.on("connection", connection => {
      connection.on("data", async data => {
        data = await super.bufferDecode(data);
        await this.dataReceived(data);

        console.log(new Buffer.from("*HQ,865205034654490,S20,130305,1,1#"));

        connection.write(new Buffer.from("*HQ,865205034654490,CF#")); // seria pra enviar dados ao coiso
      });
    });
  }

  dataReceived(data) {
    return new Promise(async (resolve, reject) => {
      try {
        data = await this.parseData(data);
        const cmd = await this.getCommand(data);
        await this.action(data, cmd);

        resolve();
      } catch (err) {
        console.log(err);
        return reject(err);
      }
    });
  }

  parseData(data) {
    return new Promise(async (resolve, reject) => {
      try {
        data = data.split(",");
        const parse = {
          start: data[0],
          device: data[1],
          cmd: data[2],
          timeInDevice: data[3],
          dataDeviceType: data[4],
          latitude: data[5],
          latitudeSymbol: data[6],
          longitude: data[7],
          longitudeSymbol: data[8],
          speed: data[9] ? Math.round(data[9] * 1.852) : null,
          orientation: data[10],
          dateInDevice: data[11],
          status: data[12]
        };

        if (parse.latitude || parse.longitude) {
          _.set(parse, "latitude", await this.getPosition(parse, "latitude"));
          _.set(parse, "longitude", await this.getPosition(parse, "longitude"));
          _.set(parse, "time", await this.timeInDevice(parse));
        }
        return resolve(parse);
      } catch (err) {
        return reject(err);
      }
    });
  }

  getCommand(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data.start != "*HQ") return reject("Comando não encontrado!");

        if (data.cmd.length > 2 && _.includes(data.cmd, "HTBT")) {
          return resolve("heartbeat");
        } else if (data.cmd == "V1") {
          return resolve("ping");
        } else {
          return reject("Comando não encontrado! Comando:", data.cmd);
        }
      } catch (err) {
        console.log(err);
        return reject(err);
      }
    });
  }

  getPosition(data, type) {
    return new Promise((resolve, reject) => {
      let sinal;
      switch (type) {
        case "latitude":
          sinal = data.latitudeSymbol == "S" ? -1 : 1;
          break;
        case "longitude":
          sinal = data.longitudeSymbol == "W" ? -1 : 1;
          break;
        default:
          reject("Não foi possivel identificar o tipo de posição!");
      }

      const position = parseFloat(data[type]);
      const parteEntera = ~~(Math.round(position) / 100);
      const parteDecimal = (position - parteEntera * 100) / 60;
      return resolve(sinal * (parteEntera + parteDecimal).toFixed(8));
    });
  }

  timeInDevice(data) {
    return new Promise(async (resolve, reject) => {
      resolve(
        moment(
          data.dateInDevice + " " + data.timeInDevice,
          "DDMMYY HH:mm:ss"
        ).toDate()
      );
    });
  }

  action(data, cmd) {
    return new Promise(async (resolve, reject) => {
      try {
        switch (cmd) {
          case "ping":
            await this.ping(data);
            resolve();
            break;
          case "heartbeat":
            await this.heartbeat(data);
            resolve();
            break;
          default:
            return reject("Não foi possivel identificar a ação.");
            break;
        }
      } catch (err) {
        return reject();
      }
    });
  }

  ping(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const deviceInfos = await this.server.broker.call(
          "data/device.getOne",
          {
            where: { code: data.device }
          }
        );
        if (!deviceInfos) return reject("Erro ao recuperar o dispositivo");

        if (this.protocol.debug) {
          console.log(
            "Opa chegou um ping PROTOCOLO GT06 de:",
            deviceInfos.id,
            "localização:",
            data.latitude,
            data.longitude,
            "orientação:",
            data.orientation,
            "velocidade:",
            data.speed
          );
        }

        const save = {
          deviceId: deviceInfos.id,
          position: {
            type: "Point",
            coordinates: [data.latitude, data.longitude]
          },
          speed: data.speed,
          orientation: data.orientation
        };
        const position = await super.savePosition(save);

        await super.broadcast(position, deviceInfos);

        return resolve();
      } catch (err) {
        return reject();
      }
    });
  }

  heartbeat(data) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("coração ta batendo");
        return resolve();
      } catch (err) {
        return reject();
      }
    });
  }
};
