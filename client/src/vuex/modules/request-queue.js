import _ from "lodash";
import moment from "moment";
import QueueAPI from "../../api/queue";

let isRequesting = false

const initialState = () => ({
    pendingQueue: [],
    processingQueue: [],
});

const state = initialState;

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
        else {
            callback(state.processingQueue)
        }
    },
    PROCESSING_QUEUE_TO_PENDING_QUEUE(state, processingQueue){
        _.reverse(processingQueue).forEach((queueItem) => {
            state.pendingQueue.unshift(queueItem)
        })
        state.processingQueue = []
    },
    REMOVE_PROCESSING_QUEUE_ITEMS(state, processedQueueItems) {
        console.log(
            "Removendo " + state.processingQueue.length + " itens da fila geral."
        );
        /*state.processedQueue = _.concat(state.processedQueue, state.processingQueue)*/
        state.processingQueue = []
    },
    /*REMOVE_PROCESSED_QUEUE_ITEMS(state, id) {
        state.processedQueue = _.filter(state.processedQueue, (queueItem) => {
            return !((queueItem.data.requestId && queueItem.data.requestId === id) || (queueItem.data.id && queueItem.data.id === id))
        })
    },*/
    ADD(state, queueItem) {
        state.pendingQueue.push(queueItem)
    },
    RESET_STATE(state) {
        const initial = initialState();
        Object.keys(initial).forEach(key => {
            state[key] = initial[key];
        });
    },
}

const actions = {
    initializeRequestQueue(ctx, socket) {
        const sendRequestQueue = processingQueue => {
            if(isRequesting){
                console.log("A fila já está aguardando por resposta do servidor")
                return
            }
            console.log(`Processando ${processingQueue.length} item(s) na fila geral!`, processingQueue)
            isRequesting = true
            QueueAPI.sendRequestQueue(processingQueue, {
                timeout: 60 * 1000
            }).then(result => {
                isRequesting = false
                ctx.commit("REMOVE_PROCESSING_QUEUE_ITEMS")
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
        }, 1000)
    },
    addToQueue(ctx, { type, op, data }) {
        const queueItem = {
            type,
            op,
            data,
            date: moment()
        }
        console.log("Item adicionado para a fila geral", queueItem)
        ctx.commit("ADD", queueItem)
    },
    clearRequestProcessingQueue(ctx) {
        ctx.commit("REMOVE_PROCESSING_QUEUE_ITEMS")
    },
    resetState(context) {
        context.commit("RESET_STATE");
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}