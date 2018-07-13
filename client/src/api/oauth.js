import Vue from "vue"
import config from '../config'

export default {
    token(body){
        const authRequestBody = {
            'grant_type': 'password',
            'scope': 'all',
            'username': body.email,
            'password': body.password
        };
        return Vue.http.post(config.apiBaseUrl + '/oauth/token', authRequestBody, {
            headers: {
                'Authorization': 'Basic OTg0NzAzNmUwYjY0ZTQ3NGNiZjRhOTdmY2MwYWNiMGQzZDE1NGFmMzpjYWY0Y2E5MDA5NzgyYmM5NmJlNjA0YTk3ZjBjYTAzNmVhOTg2YzE1'
            },
            emulateJSON: true
        }).then((response) => response.json());
    },
    refreshToken(refreshToken){
        const authRequestBody = {
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        };
        return Vue.http.post(config.apiBaseUrl + '/oauth/token', authRequestBody, {
            headers: {
                'Authorization': 'Basic OTg0NzAzNmUwYjY0ZTQ3NGNiZjRhOTdmY2MwYWNiMGQzZDE1NGFmMzpjYWY0Y2E5MDA5NzgyYmM5NmJlNjA0YTk3ZjBjYTAzNmVhOTg2YzE1'
            },
            emulateJSON: true
        }).then((response) => response.json());
    }
}
