import _ from 'lodash'

const state = {
    pendingQueue: [],
    processingQueue: []
}

const getters = {
}

const mutations = {
    PROCESS_QUEUE(state, callback){
        if(state.processingQueue.length === 0){
            state.pendingQueue.forEach((queueItem) => {
                state.processingQueue.push(queueItem)
            })
            state.pendingQueue = []
            // process
            if(state.processingQueue.length > 0){
                callback(state.processingQueue)
            }
        }
    },
    REMOVE_PROCESSED_QUEUE_ITEMS(state, processedQueueItems){
        console.log("Removendo " + state.processingQueue.length + " itens da fila.")
        state.processingQueue = []
    },
    ADD(state, queueItem){
        state.pendingQueue.push(queueItem)
    }
}

const actions = {
    initializeRequestQueue(ctx){
        setInterval(() => {
            ctx.commit('PROCESS_QUEUE', (processingQueue) => {
                console.log(`Processando ${processingQueue.length} item(s) na fila!`, processingQueue)
                setTimeout(() => {
                    ctx.commit('REMOVE_PROCESSED_QUEUE_ITEMS')
                }, 5000)
            })
        }, 1000 * 5)
    },
    addToQueue(ctx, {type,op,data}){
        const queueItem = {
            type,
            op,
            data,
            date: moment()
        }
        console.log("Item adicionado para fila",queueItem)
        ctx.commit('ADD', queueItem)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
