import _ from "lodash";
import moment from "moment";
import RequestQueueAPI from "../../api/request-queue";

let isRequesting = false

const state = {
    pendingQueue: [],
    processingQueue: []
};

const getters = {};

const mutations = {
    PROCESS_QUEUE(state, callback) {
        if (state.processingQueue.length === 0) {
            state.pendingQueue.forEach(queueItem => {
                state.processingQueue.push(queueItem);
            });
            state.pendingQueue = []
            // process
            if (state.processingQueue.length > 0) {
                callback(state.processingQueue)
            }
        }
    },
    PROCESSING_QUEUE_TO_PENDING_QUEUE(state, processingQueue){
        _.reverse(processingQueue).forEach((queueItem) => {
            state.pendingQueue.unshift(queueItem)
        })
        state.processingQueue = []
    },
    REMOVE_PROCESSED_QUEUE_ITEMS(state, processedQueueItems) {
        console.log(
            "Removendo " + state.processingQueue.length + " itens da fila."
        );
        state.processingQueue = []
    },
    ADD(state, queueItem) {
        state.pendingQueue.push(queueItem)
    }
}

const actions = {
    initializeRequestQueue(ctx, socket) {
        const sendRequestQueue = processingQueue => {
            if(isRequesting){
                console.log("A fila já está aguardando por resposta do servidor")
                return
            }
            console.log(`Processando ${processingQueue.length} item(s) na fila!`, processingQueue)
            isRequesting = true
            RequestQueueAPI.send(processingQueue, {
                timeout: 60 * 1000
            }).then(result => {
                isRequesting = false
                ctx.commit("REMOVE_PROCESSED_QUEUE_ITEMS")
                console.log("Fila de requisições processadas", result)
            }).catch(err => {
                isRequesting = false
                if(err.status === 0){
                    console.log("Sem resposta do servidor")
                    ctx.commit("PROCESSING_QUEUE_TO_PENDING_QUEUE", processingQueue)
                }
            })
        }
        setInterval(() => {
            if(socket.connected){
                ctx.commit("PROCESS_QUEUE", sendRequestQueue)
            }
            else {
                console.log("O socket não está comunicando com o servidor")
            }
        }, 1000)
    },
    addToQueue(ctx, { type, op, data }) {
        const queueItem = {
            type,
            op,
            data,
            date: moment()
        }
        console.log("Item adicionado para fila", queueItem)
        ctx.commit("ADD", queueItem)
    },
    clearProcessingQueue(ctx) {
        ctx.commit("REMOVE_PROCESSED_QUEUE_ITEMS")
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}