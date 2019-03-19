<template>
    <div class="request-board-card" tabindex="0"
         :class="{
            'request-board-card--in-displacement': _.get(card, 'status', false) === 'in-displacement',
            'request-board-card--draft': !Number.isInteger(request.id) || _.get(request,'requestUIState.hasRequestChanges',false)
            }">
        <div class="request-board-card__loading" v-if="_.get(card, 'status', false) === 'processing'">
            <span>Sincronizando...</span>
        </div>
        <div class="request-board-card__loading" v-if="!card">
            <span>...</span>
        </div>
        <div class="request-board-card__container" v-if="card && request.requestUIState && Number.isInteger(request.id)">
            <div class="request-board-card__overlay" v-if="isSaving">
                <span>Salvando...</span>
            </div>
            <div class="request-board-card__overlay" v-else-if="card.window.show">
                <span>Visualizando pedido</span>
            </div>
            <div class="request-board-card__overlay" v-else-if="request.requestUIState.hasRequestChanges">
                <span>Editando atendimento</span>
            </div>
            <div class="draft-badge" v-if="!Number.isInteger(request.id) || request.requestUIState.hasRequestChanges">
                <i class="mi mi-edit"></i>
            </div>
            <!-- if request is persisted -->
            <div class="card__header" v-if="Number.isInteger(request.id)">
                <h3 class="card__client-name">
                    {{ card.clientName ? card.clientName : "S/N" }}
                </h3>
                <span class="push-both-sides"></span>
                <h3 class="card__order" v-if="card.orderSubtotal">
                    {{ utils.formatMoney(card.orderSubtotal, 2, "R$ ", ".", ",") }}
                </h3>
            </div>
            <div class="card__header" v-else>
                <h3 class="card__client-name">Rascunho {{ card.id }}</h3>
                <h3 class="card__client-name">ID do pedido {{ request.id }}</h3>
            </div>
            <div style="display: flex; flex-direction: row;">
                <h3 class="card__client-address" v-if="card.clientAddress">
                    {{ card.clientAddress }}
                </h3>
                <h3 class="card__phone-line" v-if="request.phoneLine && false">
                    {{ request.phoneLine }}
                </h3>
            </div>
            <div class="card__middle">
                <div v-if="deadlineCheckerObj.inTime" class="delivery-time in-time">
                    <span>{{ deadlineCheckerObj.value }} {{ deadlineCheckerObj.unit }}</span>
                </div>
                <div v-else class="delivery-time">
                    <span>{{ deadlineCheckerObj.value }} {{ deadlineCheckerObj.unit }}</span>
                </div>
            </div>
            <div class="card__footer">
                <span class="push-both-sides"></span>
                <a class="footer__status">
                    <request-board-icon-status></request-board-icon-status>
                    <span>{{ status }}</span>
                </a>
                <a class="footer__responsible-user">
                    <request-board-icon-flag></request-board-icon-flag>
                    {{ responsibleUserName }}
                </a>
                <!--
                <app-popover :placement="'bottom-start'" :verticalOffset="5" :horizontalOffset="18" :contentStyle="dropdownMenuPopoverContentStyle">
                    <template slot="triggerer">
                        <a class="footer__status ignore">
                            <request-board-icon-status></request-board-icon-status>
                            <span>{{ status }}</span>
                        </a>
                    </template>
                    <template slot="content">
                        <app-rbc-status :value="card.status" @input="onRequestStatusUpdate($event)" id="rbc-status" :card="card"></app-rbc-status>
                    </template>
                </app-popover>
                <app-popover :placement="'bottom-start'" :verticalOffset="1" :horizontalOffset="19" :useScroll="true">
                    <template slot="triggerer">
                        <a class="footer__responsible-user ignore"><request-board-icon-flag></request-board-icon-flag>{{ responsibleUserName }}</a>
                    </template>
                    <template slot="content">
                        <app-rbc-user :value="card.responsibleUserId" @input="onRequestResponsibleUserUpdate($event)" id="rbc-user" :card="card"></app-rbc-user>
                    </template>
                </app-popover>
                -->
            </div>
        </div>
        <div class="request-board-card__container draft" v-if="card && request.requestUIState && !Number.isInteger(request.id)">
            <div class="request-board-card__overlay" v-if="isSaving">
                <span>Salvando...</span>
            </div>
            <div class="request-board-card__overlay" v-else-if="card.window.show">
                <span>Editando rascunho</span>
            </div>
            <div class="request-board-card__overlay" v-else>
                <span>Rascunho</span>
            </div>
            <div class="draft-badge" v-if="!Number.isInteger(request.id) || _.get(request,'requestUIState.hasRequestChanges',false)">
                <i class="mi mi-edit"></i>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from "vuex";
    import _ from "lodash";
    import utils from "../../../../utils";
    import moment from "moment";

    import RBCLocation from "./RequestBoardCard/RBCLocation.vue";
    import RBCClient from "./RequestBoardCard/RBCClient.vue";
    import RBCOrder from "./RequestBoardCard/RBCOrder.vue";
    import RBCProgress from "./RequestBoardCard/RBCProgress.vue";
    import RBCDeadline from "./RequestBoardCard/RBCDeadline.vue";
    import RBCStatus from "./RequestBoardCard/RBCStatus.vue";
    import RBCUser from "./RequestBoardCard/RBCUser.vue";

    import Request from "../../../../vuex/models/Request";
    import User from "../../../../vuex/models/User";
    import Card from "../../../../vuex/models/Card";

    export default {
        props: ["card", "request", "isDragging"],
        components: {
            "app-rbc-location": RBCLocation,
            "app-rbc-client": RBCClient,
            "app-rbc-order": RBCOrder,
            "app-rbc-progress": RBCProgress,
            "app-rbc-deadline": RBCDeadline,
            "app-rbc-status": RBCStatus,
            "app-rbc-user": RBCUser
        },
        watch: {
            "card.request.requestTimeline": {
                handler(requestTimeline) {
                    /* const sortedRequestTimeline = _.sortBy(requestTimeline, (requestTimelineItem) => {
                                    return requestTimelineItem.dateCreated
                                })
                                const lastRequestTimelineItem = _.last(sortedRequestTimeline)
                                this.form.status = lastRequestTimelineItem.status
                                this.form.responsibleUserId = lastRequestTimelineItem.userId*/
                },
                immediate: true,
                deep: true
            }
        },
        data() {
            return {
                loading: true,
                form: {
                    status: null,
                    responsibleUserId: null
                },
                inProgressRequestTimeline: [],
                overDeadlineRequestTimeline: [],
                lastItem: {
                    finishedBeforeDeadline: false,
                    time: null
                },
                current: {
                    time: {
                        value: 0,
                        abbUnit: ""
                    }
                },
                deadline: {
                    isOver: false,
                    time: {
                        value: 0,
                        abbUnit: "min"
                    }
                },
                settings: {
                    deadlineInMinutes: 30
                },
                popoverContentStyle: {
                    "background-color": "var(--bg-color--primary)",
                    padding: "8px 12px"
                },
                dropdownMenuPopoverContentStyle: {
                    "background-color": "var(--bg-color--2)",
                    padding: "8px 12px"
                },
                deadlineCheckerInterval: null,
                deadlineCheckerObj: {
                    inTime: true,
                    value: 0,
                    unit: 'segundo(s)'
                }
            };
        },
        computed: {
            ...mapState('request-queue',['pendingQueue','processingQueue']),
            isSaving(){
                const hasRequestInPendingQueue = _.some(this.pendingQueue, (queueItem) => {
                    if(queueItem.type === "request"){
                        if(queueItem.data.id === this.request.id || queueItem.data.requestId === this.request.id){
                            return true
                        }
                    }
                    return false
                })
                const hasRequestInProcessingQueue = _.some(this.processingQueue, (queueItem) => {
                    if(queueItem.type === "request"){
                        if(queueItem.data.id === this.request.id || queueItem.data.requestId === this.request.id){
                            return true
                        }
                    }
                    return false
                })
                /*const hasRequestInProcessedQueue = _.some(this.processedQueue, (queueItem) => {
                    if(queueItem.type === "request"){
                        if(queueItem.data.id === this.request.id || queueItem.data.requestId === this.request.id){
                            return true
                        }
                    }
                    return false
                })*/
                return hasRequestInPendingQueue || hasRequestInProcessingQueue
            },
            requestClientAddress() {
                if (this.request.requestClientAddresses.length) {
                    const firstClientAddress = _.first(this.request.requestClientAddresses)
                        .clientAddress;
                    const address =
                        _.truncate(_.startCase(_.toLower(firstClientAddress.address.name)), {
                            length: 24,
                            separator: "",
                            omission: "..."
                        }) +
                        ", " +
                        (firstClientAddress.number ? firstClientAddress.number : "S/N") +
                        (firstClientAddress.complement
                            ? " " + firstClientAddress.complement
                            : "");
                    return address;
                }
                return false;
            },
            orderSubtotal() {
                return _.sumBy(
                    this.request.requestOrder.requestOrderProducts,
                    requestOrderProduct => {
                        return (
                            (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) *
                            requestOrderProduct.quantity
                        );
                    }
                );
            },
            createdRequestTimelineItem() {
                return {
                    data: _.find(this.card.request.requestTimeline, { action: "create" })
                };
            },
            status() {
                switch (this.card.status) {
                    case "pending":
                        return "Pendente";
                    case "in-displacement":
                        return "Em deslocamento";
                    case "canceled":
                        return "Cancelado";
                    case "finished":
                        return "Finalizado";
                    default:
                        return "---";
                }
            },
            responsibleUserName() {
                const user = User.find(this.card.responsibleUserId);
                if (user) {
                    return user.name;
                }
                return "---";
            }
        },
        methods: {
            ...mapActions("request-board", ["updateCard"]),
            onRequestStatusUpdate(ev) {
                Card.update({
                    where: this.card.id,
                    data: {
                        status: ev
                    }
                })
            },
            onRequestResponsibleUserUpdate(ev) {
                Card.update({
                    where: this.card.id,
                    data: {
                        responsibleUserId: ev
                    }
                })
            },
            calculateDeadline(){
                let timeDiff = moment(this.request.deliveryDate).diff(moment(), 'seconds')
                if(timeDiff < 0){
                    this.deadlineCheckerObj.inTime = false
                    timeDiff = Math.abs(timeDiff)
                }
                if(timeDiff < 60){ // dentro de 60 segundos
                    this.deadlineCheckerObj.value = timeDiff
                    this.deadlineCheckerObj.unit = 'segundo(s)'
                }
                else if(timeDiff < (60 * 60)){ // dentro de 60 minutos
                    this.deadlineCheckerObj.value = timeDiff / 60
                    this.deadlineCheckerObj.unit = 'minuto(s)'
                }
                else if(timeDiff < (60 * 60 * 24)){
                    this.deadlineCheckerObj.value = (timeDiff / 60) / 60
                    this.deadlineCheckerObj.unit = 'horas(s)'
                }
                else if(timeDiff < (60 * 60 * 24 * 31)){
                    this.deadlineCheckerObj.value = ((timeDiff / 60) / 60) / 24
                    this.deadlineCheckerObj.unit = 'dia(s)'
                }
                else if(timeDiff < (60 * 60 * 24 * 31 * 12)){
                    this.deadlineCheckerObj.value = (((timeDiff / 60) / 60) / 24) / 31
                    this.deadlineCheckerObj.unit = 'mês(s)'
                }
                else if(timeDiff >= (60 * 60 * 24 * 31 * 12)){
                    this.deadlineCheckerObj.value = ((((timeDiff / 60) / 60) / 24) / 31) / 12
                    this.deadlineCheckerObj.unit = 'ano(s)'
                }
                this.deadlineCheckerObj.value = Math.round(this.deadlineCheckerObj.value)
            }
        },
        mounted() {
            if(this.deadlineCheckerInterval){
                clearInterval(this.deadlineCheckerInterval)
            }
            this.calculateDeadline()
            this.deadlineCheckerInterval = setInterval(this.calculateDeadline, 5000)
        },
        beforeDestroy() {
            clearInterval(this.deadlineCheckerInterval)
        }
    };
</script>

<style lang="scss">
    .request-board-card {
        display: flex;
        background: var(--bg-color--2);
        box-shadow: var(--card-shadow);
        position: relative;
        outline: 0;
        &:hover {
            background: var(--bg-color--3);
            .request-board-card__overlay {
                background: var(--bg-color--3);
            }
        }
    }

    .request-board-card--in-displacement {
        border: 1px dashed var(--bg-color--secondary)!important;
        a.footer__status span {
            color: var(--bg-color--secondary);
        }
        a.footer__status .colorizable {
            fill: var(--bg-color--secondary);
        }
    }

    .request-board-card--draft {
        border: 1px dashed var(--bg-color--10);
    }

    .request-board-card__container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 10px;
        text-align: center;
        max-width: 100%;
        div.draft-badge {
            position: absolute;
            right: -10px;
            top: -10px;
            background-color: var(--bg-color--2);
            border: 1px dashed var(--font-color--5);
            width: 24px;
            height: 24px;
            border-radius: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            i {
                top: -1px;
                color: var(--font-color--5);
                font-size: 16px;
            }
        }
    }

    .request-board-card__loading {
        transition: 1s all;
        width: 100%;
        height: 100%;
        background-color: var(--bg-color--2);
        position: absolute;
        z-index: 5;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .request-board-card__overlay {
        width: 100%;
        height: 100%;
        background-color: rgba(23,24,28,.9);
        position: absolute;
        z-index: 3;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .request-board-card__container.draft .request-board-card__overlay {
        background-color: transparent
    }

    .request-board-card .card__header {
        display: flex;
        flex-direction: row;
    }

    .request-board-card .card__header h3.card__order {
        font-size: 14px;
        margin-left: 5px;
        color: var(--font-color--primary);
    }

    .request-board-card h3.card__client-name {
        color: var(--font-color--7);
        font-size: 14px;
        white-space: nowrap;
        max-width: 224px;
        text-align: left;
        overflow: hidden;
    }

    .request-board-card h3.card__client-address {
        flex-grow: 1;
        color: var(--font-color--7);
        font-size: 11px;
        font-weight: 600;
        text-align: left;
    }

    .request-board-card h3.card__phone-line {
        flex-grow: 1;
        color: var(--font-color--7);
        font-size: 11px;
        font-weight: 600;
        text-align: right;
        width: 120px;
        margin-left: 10px;
    }

    .request-board-card h3.card__task {
        color: var(--font-color--7);
        font-size: 14px;
        font-weight: initial;
    }

    .request-board-card h3.card__task--add {
        color: var(--font-color--2);
        font-size: 14px;
        font-weight: initial;
    }

    .request-board-card h3.card__task--add:hover {
        color: var(--font-color);
    }

    .card-unread-item-chat-count {
        position: absolute;
        background-color: var(--font-color--danger);
        display: flex;
        opacity: 0.9;
        width: 14px;
        color: rgb(255, 255, 255);
        height: 14px;
        left: 20px;
        bottom: 18px;
        z-index: 1;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        font-size: 8px;
        pointer-events: none;
    }

    /* middle */

    .card__middle {
        display: flex;
        position: relative;
        flex-grow: 1;
        align-items: center;
        justify-content: flex-end;
        .delivery-time {
            span {
                color: var(--font-color--danger);
            }
            &.in-time {
                span {
                    color: var(--font-color--primary);
                }
            }
        }
    }
    .card__middle .card__timer {
        display: flex;
        flex-grow: 1;
        height: 50px;
        position: relative;
    }
    .card__middle .timer__objects {
        z-index: 3;
        position: relative;
        display: flex;
        flex-direction: row;
        flex-grow: 1;
    }
    .card__middle .card__timer .timer__line {
        z-index: 1;
        background-image: linear-gradient(
                        to right,
                        var(--border-color--1) 50%,
                        rgba(255, 255, 255, 0) 0%
        );
        background-position: bottom left;
        background-size: 6px 2px;
        background-repeat: repeat-x;
        width: 100%;
        height: 2px;
        align-self: center;
        position: absolute;
    }
    .card__middle .timer__objects {
        display: flex;
        align-items: center;
    }
    .card__middle .objects__timer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .card__middle .objects__timer .timer__hours {
        position: absolute;
        margin-top: -5px;
        font-size: 10px;
    }
    .card__middle .objects__timer .timer__minutes {
        position: absolute;
        margin-top: 6px;
        font-weight: 600;
        font-size: 12px;
    }
    .card__middle .objects__timer.over .timer__hours,
    .card__middle .objects__timer.over .timer__minutes {
        color: var(--font-color--danger);
    }
    .card__middle .objects__timer .fill {
        fill: var(--bg-color);
    }
    .card__middle .objects__timer .stroke {
        stroke: var(--font-color--2);
    }
    .card__middle .objects__timeline {
        position: relative;
        display: flex;
        align-items: center;
        flex-grow: 1;
    }

    /* history progress */

    .card__middle .objects__timeline .timeline__progress {
        position: absolute;
        left: 0; /* and goes until 199px */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        /* transition: all 0.5s ease; */
    }
    .card__middle .objects__timeline .timeline__progress span.progress__progress {
        position: absolute;
        font-weight: 600;
        font-size: 12px;
        margin-top: -8px;
        color: var(--font-color--3);
    }
    .card__middle
    .objects__timeline
    .timeline__progress
    span.progress__progress--unit {
        position: absolute;
        font-weight: 600;
        font-size: 9px;
        margin-top: 3px;
        color: var(--font-color--3);
    }
    .card__middle .objects__timeline .timeline__progress .fill {
        fill: var(--bg-color);
    }
    .card__middle .objects__timeline .timeline__progress .stroke {
        stroke: var(--font-color--2);
    }

    /* current progress */

    .card__middle .objects__timeline .timeline__progress--current {
        position: absolute;
        left: 120px; /* and goes until 199px */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
        /* transition: all 0.5s ease; */
    }
    .card__middle
    .objects__timeline
    .timeline__progress--current
    span.progress__progress {
        position: absolute;
        font-weight: 600;
        font-size: 12px;
        margin-top: -8px;
        color: var(--font-color--8);
    }
    .card__middle
    .objects__timeline
    .timeline__progress--current
    span.progress__progress--unit {
        position: absolute;
        font-weight: 600;
        font-size: 9px;
        margin-top: 3px;
        color: var(--font-color--8);
    }
    .card__middle .objects__timeline .timeline__progress--current .fill {
        fill: var(--bg-color--secondary);
    }
    .card__middle .objects__timeline .timeline__progress--current .stroke {
        stroke: var(--bg-color--secondary);
    }

    /* deadline */

    .card__middle .objects__deadline {
        width: 36px;
        height: 42px;
        border: 2px solid var(--font-color--2);
        border-radius: 5px;
        background: var(--bg-color);
        justify-content: center;
        display: flex;
    }

    .card__middle .deadline__time {
        top: 9px;
        font-weight: 600;
        position: absolute;
        color: var(--font-color--d-secondary);
    }
    .card__middle .deadline__label {
        top: 24px;
        position: absolute;
        font-size: 12px;
        color: var(--font-color--d-secondary);
    }

    .card__middle .objects__deadline.in-time .deadline__time,
    .card__middle .objects__deadline.in-time .deadline__label {
        color: var(--font-color--d-primary);
    }

    .card__middle .objects__deadline.over .deadline__time,
    .card__middle .objects__deadline.over .deadline__label {
        color: var(--font-color--danger);
    }

    /* footer */

    .card__footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        overflow: hidden;
    }

    .card__footer span.footer__location {
        margin: 0;
        color: var(--font-color--2);
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-shrink: 0;
    }

    .card__footer span.footer__location svg {
    }

    .card__footer span,
    .card__footer a {
        margin: 0 0 0 20px;
        position: relative;
        display: flex;
        align-items: center;
        color: var(--font-color);
        font-weight: 600;
    }

    .card__footer a.chat-button {
        margin: 0 8px 0 0;
    }

    .card__footer a.chat-button i {
        font-size: 18px;
        color: var(--font-color--2);
    }

    .card__footer span svg,
    .card__footer a svg {
        margin-right: 7px;
    }

    .card__footer .footer__responsible-user,
    .card__footer .status {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-shrink: 0;
    }

    .card__footer .footer__status span {
        white-space: nowrap;
        margin-left: 0;
        font-weight: 600;
        font-size: 12px;
    }

    .card__footer .footer__responsible-user {
        font-weight: 600;
        font-size: 12px;
    }

    .card__footer .footer__location {
        font-weight: 600;
        font-size: 12px;
    }
</style>
