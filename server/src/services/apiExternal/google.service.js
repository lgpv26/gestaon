import _ from "lodash"
import moment from "moment"
import fs from "fs"
import config from '~server/config'

const {google} = require('googleapis')
const scopes = config.google.scopes
const token_path = config.google.tokenPath
const keys = JSON.parse(fs.readFileSync(config.google.credentials))

module.exports = (server) => {
    return {
        name: "apiExternal/google",
        actions: {

            start(ctx) {
                const vm = this
                return new Promise(async (resolve, reject) => {
                    try {
                        const auth = await ctx.call("apiExternal/google.authorize", {
                            data: ctx.params.data
                        })
                        console.log("Logado com sucesso", moment().format("DD/MM/YY HH:mm:ss"))

                        
                    }
                    catch(err){
                        return reject(err)
                    }
                })
            },

            authorize(ctx) {
                return new Promise((resolve, reject) => {
                    console.log("Logando no google drive", moment().format("DD/MM/YY HH:mm:ss"))
                    
                    const {client_secret, client_id, redirect_uris} = keys.installed
                    const oAuth2Client = new google.auth.OAuth2(
                        client_id, client_secret, redirect_uris[0])
                
                    // Check if we have previously stored a token.
                    fs.readFile(token_path, async (err, token) => {
                        if (err) {
                            const accessToken = await ctx.call("apiExternal/google.getAccessToken", {
                                oAuth2Client,
                                data: ctx.params.data
                            })
                            return reject(accessToken)
                        }
                        oAuth2Client.setCredentials(JSON.parse(token))
                        return resolve(oAuth2Client)
                    })
                })
            },
            /**
             * Get and store new token after prompting for user authorization, and then
             * execute the given callback with the authorized OAuth2 client.
             * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
             * @param {getEventsCallback} callback The callback for the authorized client.
             */
            getAccessToken(ctx) {
                const vm = this
                    return new Promise((resolve, reject) => {
                        if(!ctx.params.data || !ctx.params.data.code) {
                            const authUrl = ctx.params.oAuth2Client.generateAuthUrl({
                                access_type: 'offline',
                                scope: scopes,
                            });
                            console.log('Authorize this app by visiting this url:', authUrl)
                            return resolve('Authorize this app by visiting this url:' + authUrl)
                        }
                        else {
                            if(!_.has(ctx.params.data, "code")) return resolve("Favor informar o código.")
                            console.log(ctx.params.data.code, ctx.params.oAuth2Client)
                            ctx.params.oAuth2Client.getToken(ctx.params.data.code, (err, token) => {
                                if (err) return resolve("Error retrieving access token" + err)
                                ctx.params.oAuth2Client.setCredentials(token)
                                // Store the token to disk for later program executions
                                fs.writeFile(token_path, JSON.stringify(token), (err) => {
                                    if (err) return resolve(err)
                                    return resolve('Token stored to', token_path)
                                })
                            })
                       
                        }   
                    })
            }
        }
    }
}
