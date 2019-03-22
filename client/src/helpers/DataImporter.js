import ss from "socket.io-stream"
import moment from "moment"

import { mapState, mapActions } from 'vuex'

export default {
    computed:{
        ...mapState(["app", "system", "lastDataSyncedDate", "lastRequestsLoadedDate"]),
    },
    methods: {
        ...mapActions(["setLastDataSyncedDate","setLastRequestsLoadedDate"]),
        importFromLastDataSyncedDate(){
            if(!window.isAppLoading()){
                console.log("Not showing loading")
                window.showAppLoading()
            }
            console.log("Última data de sincronização", moment(this.lastDataSyncedDate).format("DD/MM/YYYY HH:mm:ss"))
            window.setAppLoadingText(`Importando dados novos...`)
            this.stream = ss.createStream()
            ss(this.$socket).emit("import", this.stream, { dateLastSynced: this.lastDataSyncedDate})
        }
    },
    created(){
    }
};
