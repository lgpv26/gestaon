import _ from "lodash";
import mysqldump from "mysqldump";
import config from "~server/config";
import moment from "moment";
import pako from "pako";
import fs from "fs";
import ProgressBar from "progress";
import chalk from "chalk";

const { google } = require("googleapis");

module.exports = server => {
  return {
    name: "backup",
    actions: {
      start(ctx) {
        const vm = this;
        const timeTotal = moment();
        const dir = "./src/tmp/backup";

        const fileName = moment()
          .format("HH-mm")
          .toString();

        return new Promise(async (resolve, reject) => {
          try {
            console.log(
              "Iniciando rotina de backup",
              moment().format("DD/MM/YY HH:mm")
            );
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }

            let timeParcial = moment();
            console.log(
              "Iniciado dump no db",
              moment().format("DD/MM/YY HH:mm:ss")
            );
            //need add to mysqldump node-modules on dist/cjs geometry dataTypes and GeomFromText to ST_GeomFromText
            await mysqldump({
              connection: {
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.dbName
              },
              dumpToFile: dir + "/" + fileName + ".sql"
            });

            console.log(
              "Finalizado dump no db, duração: ",
              moment().diff(timeParcial, "seconds")
            );
            timeParcial = moment();

            const data = await fs.readFileSync(
              dir + "/" + fileName + ".sql",
              "utf-8"
            );

            console.log(
              "Iniciado compactação",
              moment().format("DD/MM/YY HH:mm:ss")
            );
            const gzipJson = pako.gzip(data);

            await new Promise((resolve, reject) => {
              fs.writeFile(
                dir + "/" + fileName + ".txt.gz",
                gzipJson,
                "utf8",
                err => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
            console.log(
              "Finalizado compactação no db, duração: ",
              moment().diff(timeParcial, "seconds")
            );

            fs.unlinkSync(dir + "/" + fileName + ".sql");
            console.log(
              "Arquivo base excluido com sucesso",
              moment().format("DD/MM/YY HH:mm:ss")
            );

            // call google drive function
            timeParcial = moment();
            await vm.googleDriveUpload(dir, fileName + ".txt.gz");
            console.log(
              "Finalizado upload no google drive, duração: ",
              moment().diff(timeParcial, "seconds")
            );

            console.log(
              "Finalizado processo de backup, duração: ",
              moment().diff(timeTotal, "seconds")
            );

            return resolve();
          } catch (err) {
            console.log(err);
          }
        });
      }
    },
    methods: {
      async googleDriveUpload(dir, file) {
        console.log(
          "Iniciado processo de upload, ",
          moment().format("DD/MM/YY HH:mm:ss")
        );
        return new Promise(async (resolve, reject) => {
          const auth = await server.broker.call("apiExternal/google.authorize");
          console.log(
            "Logado com sucesso",
            moment().format("DD/MM/YY HH:mm:ss")
          );

          const drive = google.drive({ version: "v3", auth });

          const pathUpload = await this.checkPath(drive);
          console.log(
            "Caminho setado para upload",
            moment().format("DD/MM/YY HH:mm:ss")
          );

          const fileSize = fs.statSync(dir + "/" + file).size;

          const bar = new ProgressBar(
            "Uploading: [" +
              chalk.magenta(":bar") +
              "]" +
              chalk.green(":percent") +
              " :etas",
            {
              complete: "=",
              incomplete: " ",
              width: 20,
              total: fileSize
            }
          );

          await drive.files.create(
            {
              media: {
                body: fs.createReadStream(dir + "/" + file),
                mimeType: "application/gzip"
              },
              resource: {
                name: "Hora " + file.replace("-", ":"),
                parents: [pathUpload.id]
              }
            },
            {
              onUploadProgress: evt => {
                if (!bar.complete) bar.tick(evt.bytesRead);
                return Promise.resolve();
              }
            }
          );

          return resolve();
        });
      },

      checkPath(drive) {
        return new Promise(async (resolve, reject) => {
          console.log(
            "Preparando pasta para upload",
            moment().format("DD/MM/YY HH:mm:ss")
          );

          const date = moment()
            .format("DD/MM/YY")
            .toString();
          const res = await drive.files.list({
            q:
              "name='" +
              date +
              "' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: "nextPageToken, files(id, name),files/parents"
          });
          if (res.data.files.length) return resolve(res.data.files[0]);

          const metaDados = {
            name: date,
            mimeType: "application/vnd.google-apps.folder"
          };

          console.log(
            "Criando pasta para upload",
            moment().format("DD/MM/YY HH:mm:ss")
          );

          const createFolder = await drive.files.create({
            resource: metaDados,
            fields: ["id", "name", "parents"]
          });
          if (createFolder.status != 200)
            return reject("Não foi possivel criar a pasta");

          const dateToExclude = moment()
            .subtract(7, "days")
            .format("DD/MM/YY")
            .toString();

          console.log(
            "Excluindo backups anteriores (7 dias) e limpando lixeira",
            moment().format("DD/MM/YY HH:mm:ss")
          );

          const filesToExclude = await drive.files.list({
            q: "name='" + dateToExclude + "' or trashed=true"
          });

          let promisesExclude = [];
          if (filesToExclude.data.files.length) {
            filesToExclude.data.files.forEach(fileToExclude => {
              promisesExclude.push(
                new Promise(async (resolve, reject) => {
                  await drive.files.delete({
                    fileId: fileToExclude.id
                  });
                  resolve();
                })
              );
            });
          }

          await Promise.all(promisesExclude);
          // await drive.files.delete({
          //     fileId: createFolder.data.id
          // })

          return resolve(_.assign(metaDados, createFolder.data));
        });
      }
    }
  };
};
