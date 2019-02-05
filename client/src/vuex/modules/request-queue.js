import _ from "lodash";
import moment from "moment";
import RequestQueueAPI from "../../api/request-queue";

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
        state.processingQueue = [];
    },
    ADD(state, queueItem) {
        state.pendingQueue.push(queueItem);
    }
};

const actions = {
    initializeRequestQueue(ctx, socket) {
        const sendRequestQueue = processingQueue => {
            console.log(
                `Processando ${processingQueue.length} item(s) na fila!`,
                processingQueue
            )
            RequestQueueAPI.send(processingQueue, {
                timeout: 3000
            }).then(result => {
                ctx.commit("REMOVE_PROCESSED_QUEUE_ITEMS")
                console.log("Sucesso", result)
            }).catch(err => {
                if(err.status === 0){
                    console.log("Sem conexão")
                    ctx.commit("PROCESSING_QUEUE_TO_PENDING_QUEUE", processingQueue)
                    return
                }
                console.log("Erro", err)
            })
        }
        setInterval(() => {
            if(socket.connected){
                ctx.commit("PROCESS_QUEUE", sendRequestQueue)
            }
            else {
                console.log("Socket is not connected")
            }
        }, 1000 * 5)
    },
    addToQueue(ctx, { type, op, data }) {
        const queueItem = {
            type,
            op,
            data,
            date: moment()
        };
        console.log("Item adicionado para fila", queueItem);
        ctx.commit("ADD", queueItem);
    },
    clearProcessingQueue(ctx) {
        ctx.commit("REMOVE_PROCESSED_QUEUE_ITEMS");
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
