import Protocol from "../Protocol"
import _ from "lodash"
import moment from "moment"

module.exports = class OSMAND extends Protocol {

    constructor(server, protocol) {
        super(server, protocol)

        this.server = server
        this.protocol = protocol   

        this.protocolServer = null
    }

    init() {
        return new Promise(async (resolve, reject) => {
            await super.createServer()
            this.connectionListen()
               
            resolve()
        })
    }

    connectionListen(){
        this.protocolServer = super.getProtocolServer()

        this.protocolServer.post('/', async (req, res, next) => {
            await this.dataReceived(req)

            return res.send(200, {success: true, data: "ok"})             
        })
    }

    dataReceived(data){
        return new Promise(async (resolve, reject) => {
            try {
                data = await this.parseData(data)
                const cmd = await this.getCommand(data)
                await this.action(data, cmd)

                resolve()
            }
            catch(err) {
                console.log(err)
                return reject(err)
            }
        })
    }

    parseData(data){
        return new Promise(async (resolve, reject) => {
            try {
                console.log(data.query.speed)
                const parse = {
                    device: data.query.id,
                    cmd: "ping",
                    time: moment.unix(parseInt(data.query.timestamp)).toDate(),
                    latitude: data.query.lat,
                    //latitudeSymbol: (req.query.lat) ? : ,
                    longitude: data.query.lon,
                    //longitudeSymbol: data[8],
                    speed:(parseInt(data.query.speed, 10) * 1.85).toFixed(2),
                    orientation: data.query.bearing,
                    battery: data.query.batt,
                    altitude: data.query.altitude
                }

                //return console.log(parse)
                return resolve(parse)
            }
            catch(err) {
                return reject(err)
            }
        })
    }

    getCommand(data){
        return new Promise(async (resolve, reject) => {
            try {
                return resolve('ping')
            }
            catch (err) {
                console.log(err)
                return reject(err)
            }
        })
    }

    action(data, cmd){
        return new Promise(async (resolve, reject) => {
            try {
                switch (cmd) {
                    case 'ping':
                        await this.ping(data)
                        resolve()
                        break;
                    case 'heartbeat':
                            await this.heartbeat(data)
                            resolve()
                        break;
                    default:
                        return reject("Não foi possivel identificar a ação.")
                        break;
                }
            }
            catch (err) {
                return reject()
            }
        })
    }

    ping(data){
        return new Promise(async (resolve, reject) => {
            try {
                const deviceInfos = await this.server.broker.call("data/device.getOne", {
                    where: {code: data.device}
                })
                if(!deviceInfos) return reject("Erro ao recuperar o dispositivo")

                if(this.protocol.debug) {
                    console.log("Opa chegou um ping PROTOCOLO OSMAND de:", deviceInfos.id, "localização:", data.latitude, data.longitude, "orientação:", data.orientation, "velocidade:", data.speed)
                }

                const save = {
                    deviceId: deviceInfos.id, 
                    position: { type: 'Point', coordinates: [data.latitude, data.longitude] },
                    speed: data.speed,
                    orientation: data.orientation
                }
                const position = await super.savePosition(save)

                await super.broadcast(position, deviceInfos)

                return resolve()
            }
            catch(err){
                return reject()
            }

        })
    }

    heartbeat(data){
        return new Promise(async (resolve, reject) => {
            try {
                console.log("coração ta batendo")
                return resolve()
            }
            catch(err){
                return reject()
            }

        })
    }
}