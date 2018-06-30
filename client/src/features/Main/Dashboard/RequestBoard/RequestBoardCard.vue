<template>
    <div class="request-board-card" :class="{'request-board-card--in-displacement': form.status === 'in-displacement'}">
        <div class="request-board-card__loading" v-if="false">
            <span>Carregando...</span>
        </div>
        <div class="request-board-card__container">
            <div class="card__header">
                <app-popover :contentStyle="popoverContentStyle" style="flex-grow: 1" :placement="'bottom-start'" :verticalOffset="5">
                    <template slot="triggerer">
                        <h3 class="card__client-name">{{ card.request.client.name }}</h3>
                    </template>
                    <template slot="content">
                        <app-rbc-client id="rbc-client" :card="card"></app-rbc-client>
                    </template>
                </app-popover>
                <app-popover :contentStyle="popoverContentStyle" :placement="'bottom-end'" :verticalOffset="5">
                    <template slot="triggerer">
                        <h3 class="card__order">{{ utils.formatMoney(orderSubtotal, 2,'R$ ','.',',') }}</h3>
                    </template>
                    <template slot="content">
                        <app-rbc-order id="rbc-order" :card="card"></app-rbc-order>
                    </template>
                </app-popover>
            </div>
            <!--<h3 class="card__task" v-if="hasTaskInstruction">{{ card.request.task.text }}</h3>
            <h3 class="card__task--add" v-else @click="onAddTaskClick()">+ Incluir Tarefa ou Anotação</h3>-->
            <div class="card__middle">
                <div class="card__timer">
                    <div class="timer__objects">
                        <div class="objects__timer">
                            <app-popover :placement="'right'" :verticalOffset="5" :contentStyle="popoverContentStyle" :triggererStyle="{justifyContent: 'center'}">
                                <template slot="triggerer">
                                    <span class="timer__hours">{{ moment(card.request.dateCreated).format("HH") }}</span>
                                    <span class="timer__minutes">{{ moment(card.request.dateCreated).format("mm") }}</span>
                                    <request-board-icon-timer></request-board-icon-timer>
                                </template>
                                <template slot="content">
                                    <app-rbc-progress :card="card" :requestTimelineItem="createdRequestTimelineItem"></app-rbc-progress>
                                </template>
                            </app-popover>
                        </div>
                        <div class="objects__timeline">
                            <div class="timeline__progress--current" v-if="!deadline.isOver && form.status !== 'finished'" :style="{left: current.left + 'px'}">
                                <span class="progress__progress">{{ current.time }}</span>
                                <request-board-icon-progress-shield></request-board-icon-progress-shield>
                            </div>
                            <div class="timeline__progress" v-for="(inProgressRequestTimelineItem, index) in inProgressRequestTimeline"
                                :style="{left: inProgressRequestTimelineItem.left + 'px'}">
                                <app-popover :contentStyle="popoverContentStyle" :verticalOffset="5" :triggererStyle="{justifyContent: 'center'}">
                                    <template slot="triggerer">
                                        <span class="progress__progress">{{ inProgressRequestTimelineItem.timeUntilNow }}</span>
                                        <request-board-icon-progress-shield></request-board-icon-progress-shield>
                                    </template>
                                    <template slot="content">
                                        <app-rbc-progress :card="card" :requestTimelineItem="inProgressRequestTimelineItem"></app-rbc-progress>
                                    </template>
                                </app-popover>
                            </div>
                        </div>
                        <div class="objects__deadline" ref="deadline" :class="{ over: deadline.isOver }">
                            <app-popover :contentStyle="popoverContentStyle" :placement="'left'" :verticalOffset="20" :triggererStyle="{justifyContent: 'center'}">
                                <template slot="triggerer">
                                    <span class="deadline__time">{{ deadline.time }}</span>
                                    <span class="deadline__label">min</span>
                                </template>
                                <template slot="content">
                                    <app-rbc-deadline :card="card" :deadline="deadline" :overDeadlineRequestTimeline="overDeadlineRequestTimeline"></app-rbc-deadline>
                                </template>
                            </app-popover>
                        </div>
                    </div>
                    <div class="timer__line"></div>
                </div>
            </div>
            <div class="card-unread-item-chat-count" v-if="card.request.unreadChatItemCount">{{ card.request.unreadChatItemCount }}</div>
            <div class="card__footer">
                <div style="display: flex; position: relative;">
                    <a class="chat-button" href="javascript:void(0)" @click="$modal.show('request-chat', { requestChat: { requestId: card.request.id , cardId: card.id  } })">
                        <i class="mi mi-chat"></i>
                    </a>
                </div>
                <app-popover :placement="'top-start'" :verticalOffset="5" :contentStyle="popoverContentStyle">
                    <template slot="triggerer">
                        <span class="footer__location" ref="footerLocation">
                            <request-board-icon-location></request-board-icon-location>
                        </span>
                    </template>
                    <template slot="content">
                        <app-rbc-location id="rbc-location" :card="card"></app-rbc-location>
                    </template>
                </app-popover>
                <span class="push-both-sides"></span>
                <app-popover :placement="'bottom-center'" :verticalOffset="5" :horizontalOffset="20" :contentStyle="dropdownMenuPopoverContentStyle">
                    <template slot="triggerer">
                        <a class="footer__status ignore">
                            <request-board-icon-status></request-board-icon-status>
                            <span>{{ status }}</span>
                        </a>
                    </template>
                    <template slot="content">
                        <app-rbc-status id="rbc-status" :cardId="card.id" v-model="form.status"></app-rbc-status>
                    </template>
                </app-popover>
                <app-popover :placement="'bottom-start'" :verticalOffset="5" :horizontalOffset="18" :useScroll="true">
                    <template slot="triggerer">
                        <a class="footer__responsible-user ignore"><request-board-icon-flag></request-board-icon-flag> {{ responsibleUserName }}</a>
                    </template>
                    <template slot="content">
                        <app-rbc-user id="rbc-user" :cardId="card.id" v-model="form.responsibleUserId"></app-rbc-user>
                    </template>
                </app-popover>
            </div>
            <!--
            <app-rbc-progress v-for="(requestTimelineItem, index) in requestTimeline" :key="requestTimelineItem.data.id"
            :card="card" :requestTimelineItem="requestTimelineItem"
            :id="'rbc-progress' + '-' + requestTimelineItem.data.id"></app-rbc-progress>
            -->
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import DraggableComponent from 'vuedraggable';
    import Scrollbar from 'smooth-scrollbar';
    import Vue from 'vue'
    import _ from 'lodash';
    import utils from '@/utils'
    import moment from 'moment'

    import RBCLocation from './RequestBoardCard/RBCLocation.vue'
    import RBCClient from './RequestBoardCard/RBCClient.vue'
    import RBCOrder from './RequestBoardCard/RBCOrder.vue'
    import RBCProgress from './RequestBoardCard/RBCProgress.vue'
    import RBCDeadline from './RequestBoardCard/RBCDeadline.vue'
    import RBCStatus from './RequestBoardCard/RBCStatus.vue'
    import RBCUser from './RequestBoardCard/RBCUser.vue'

    export default {
        props: ['card','isDragging'],
        components: {
            'app-rbc-location': RBCLocation,
            'app-rbc-client': RBCClient,
            'app-rbc-order': RBCOrder,
            'app-rbc-progress': RBCProgress,
            'app-rbc-deadline': RBCDeadline,
            'app-rbc-status': RBCStatus,
            'app-rbc-user': RBCUser
        },
        watch: {
            'card.request.requestTimeline': {
                handler(requestTimeline){
                    const sortedRequestTimeline = _.sortBy(requestTimeline, (requestTimelineItem) => {
                        return requestTimelineItem.dateCreated
                    })
                    const lastRequestTimelineItem = _.last(sortedRequestTimeline)
                    this.form.status = lastRequestTimelineItem.status
                    this.form.responsibleUserId = lastRequestTimelineItem.userId
                },
                immediate: true,
                deep: true
            }
        },

        sockets: {
            requestBoardRequestTimelineChangeUser(ev){
                if(ev.success && ev.evData.cardId === this.card.id){
                    console.log("Received requestBoardRequestTimelineChangeUser", ev.evData)
                    const card = utils.removeReactivity(this.card)
                    card.request.requestTimeline.push(ev.evData.requestTimelineItem)
                    _.assign(card.request, {
                        userId: ev.evData.requestTimelineItem.userId,
                        status: ev.evData.requestTimelineItem.status
                    })
                    this.updateCard({
                        cardId: this.card.id,
                        card
                    })
                }
            },
            requestBoardRequestTimelineChangeStatus(ev){
                if(ev.success && ev.evData.cardId === this.card.id){
                    console.log("Received requestBoardRequestTimelineChangeStatus", ev.evData)
                    const card = utils.removeReactivity(this.card)
                    card.request.requestTimeline.push(ev.evData.requestTimelineItem)
                    _.assign(card.request, {
                        userId: ev.evData.requestTimelineItem.userId,
                        status: ev.evData.requestTimelineItem.status
                    })
                    this.updateCard({
                        cardId: this.card.id,
                        card
                    })
                }
            }
        },
        data(){
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
                    time: null
                },
                deadline: {
                    isOver: false,
                    time: null
                },
                settings: {
                    deadlineInMinutes: 30
                },
                popoverContentStyle: {
                    'background-color': 'var(--bg-color--primary)',
                    'padding': '8px 12px'
                },
                dropdownMenuPopoverContentStyle: {
                    'background-color': 'var(--bg-color--2)',
                    'padding': '8px 12px'
                }
            }
        },
        computed: {
            ...mapState('data/users', ['users']),
            hasTaskInstruction(){
                return _.has(this.card, 'request.task.text')
            },
            orderSubtotal(){
                return _.sumBy(this.card.request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                })
            },
            createdRequestTimelineItem(){
                return {
                    data: _.find(this.card.request.requestTimeline, {action:'create'})
                }
            },
            status(){
                switch(this.form.status){
                    case "pending":
                        return "Pendente"
                        break;
                    case "in-displacement":
                        return "Em deslocamento"
                        break;
                    case "canceled":
                        return "Cancelado"
                        break;
                    case "finished":
                        return "Finalizado"
                        break;
                    default:
                        return "---"
                }
            },
            responsibleUserName(){
                const responsibleUser = _.find(this.users, {
                    id: this.form.responsibleUserId
                })
                if(responsibleUser)
                    return responsibleUser.name
                else
                    return '---'
            }
        },
        methods: {
            ...mapActions('request-board',['updateCard']),

        },
        mounted(){
            const vm = this
            setTimeout(() => {
                vm.loading = false;
            }, 1000)
            const eachInterval = () => {
                const startDate = moment(vm.card.request.dateCreated)
                const deadlineDatetime = moment(vm.card.request.deadlineDatetime)
                const nowDate = moment()

                // mapping and filtering
                vm.inProgressRequestTimeline = _.map(_.filter(vm.card.request.requestTimeline, (requestTimelineItem) => {
                    // if(requestTimelineItem.action === 'create') return false
                    const requestTimelineItemDate = moment(requestTimelineItem.dateCreated)
                    /*const diffUntilTimelineItemInSec = moment.duration(requestTimelineItemDate.diff(startDate)).asSeconds()
                    const diffUntilNowInSec = moment.duration(deadlineDatetime.diff(nowDate)).asSeconds()*/

                    const deadlineToTimelineItemInSec = moment.duration(deadlineDatetime.diff(requestTimelineItemDate)).asSeconds()

                    return (deadlineToTimelineItemInSec > 0) && (requestTimelineItem.action !== 'create') && (requestTimelineItem.status !== 'finished')
                }), (requestTimelineItem, index) => {

                    const requestTimelineItemDate = moment(requestTimelineItem.dateCreated)
                    const deadlineToStartInSec = moment.duration(deadlineDatetime.diff(startDate)).asSeconds()
                    const deadlineToTimelineItemInSec = moment.duration(deadlineDatetime.diff(requestTimelineItemDate)).asSeconds()
                    const startToTimelineItemInSec = deadlineToStartInSec - deadlineToTimelineItemInSec

                    const percentage = (startToTimelineItemInSec / deadlineToStartInSec) * 100
                    const maxWidthInPxs = 200 // max width in pixels, of the progress bar
                    const leftInPxs = (maxWidthInPxs * percentage) / 100

                    let timeUntilNow = Math.floor(startToTimelineItemInSec / 60)
                    if(timeUntilNow < 0) timeUntilNow = 0

                    return {
                        timeUntilNow: timeUntilNow,
                        left: leftInPxs,
                        data: requestTimelineItem
                    }
                })

                vm.overDeadlineRequestTimeline = _.filter(vm.card.request.requestTimeline, (requestTimelineItem) => {
                    // if(requestTimelineItem.action === 'create') return false
                    const requestTimelineItemDate = moment(requestTimelineItem.dateCreated)

                    const deadlineToTimelineItemInSec = moment.duration(deadlineDatetime.diff(requestTimelineItemDate)).asSeconds()

                    return (deadlineToTimelineItemInSec <= 0) || (requestTimelineItem.status === 'finished')
                })

                // some variables
                const deadlineToNowInSec = moment.duration(deadlineDatetime.diff(nowDate)).asSeconds()
                const deadlineToStartInSec = moment.duration(deadlineDatetime.diff(startDate)).asSeconds()
                const startToNowInSec = deadlineToStartInSec - deadlineToNowInSec
                const startToNowInMin = Math.floor(Math.abs(startToNowInSec) / 60)

                if(deadlineToNowInSec <= 0){
                    this.deadline.isOver = true
                    const overTime = Math.floor(Math.abs(deadlineToNowInSec) / 60)
                    if(overTime > 99){
                        this.deadline.time = '+99'
                    }
                    else {
                        this.deadline.time = startToNowInMin
                    }
                }
                else {
                    this.deadline.isOver = false
                    this.deadline.time = Math.floor(Math.abs(deadlineToStartInSec) / 60)
                }

                if(this.card.request.status !== 'finished' && !this.deadline.isOver){
                    const percentage = (startToNowInSec / deadlineToStartInSec) * 100
                    const maxWidthInPxs = 200 // max width in pixels, of the progress bar
                    const leftInPxs = (maxWidthInPxs * percentage) / 100

                    this.current = {
                        time: startToNowInMin,
                        left: leftInPxs
                    }
                }

                if(this.card.request.status === 'finished'){
                    const lastTimelineItem = _.last(this.card.request.requestTimeline)
                    if(lastTimelineItem.status === 'finished'){
                        const finishedDate = moment(lastTimelineItem.dateCreated)
                        const finishToStartInSec = moment.duration(finishedDate.diff(startDate)).asSeconds()
                        const finishToStartInMin = Math.floor(Math.abs(finishToStartInSec) / 60)

                        if(deadlineToStartInSec < finishToStartInSec){
                            this.deadline.isOver = true
                            if(finishToStartInMin > 99){
                                this.deadline.time = '+99'
                            }
                            else {
                                this.deadline.time = finishToStartInMin
                            }
                        }
                        else {
                            this.deadline.isOver = false
                            this.deadline.time = finishToStartInMin
                        }

                    }
                }
            }
            eachInterval()
            vm.requestTimelineInterval = setInterval(() => eachInterval(), 3000)
        },
        beforeDestroy(){
            clearInterval(this.requestTimelineInterval)
        }
    }
</script>

<style lang="scss">
    .request-board-card {
        display: flex;
        background: var(--bg-color--2);
        box-shadow: var(--card-shadow);
        position: relative;
    }

    .request-board-card--in-displacement {
        border: 1px dashed var(--bg-color--secondary);
        a.footer__status span {
            color: var(--bg-color--secondary);
        }
        a.footer__status .colorizable {
            fill: var(--bg-color--secondary);
        }
    }

    .request-board-card__container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 10px;
        text-align: center;
        max-width: 100%;
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
        pointer-events: none
    }

    /* middle */

    .card__middle {
        display: flex;
        position: relative;
        flex-grow: 1;
        align-items: center;
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
        background-image: linear-gradient(to right, var(--border-color--1) 50%, rgba(255,255,255,0) 0%);
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
    .card__middle .objects__timer .fill {
        fill: var(--bg-color)
    }
    .card__middle .objects__timer .stroke {
        stroke: var(--font-color--2)
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
        font-size: 14px;
        margin-top: -5px;
        color: var(--font-color--3)
    }
    .card__middle .objects__timeline .timeline__progress .fill {
        fill: var(--bg-color)
    }
    .card__middle .objects__timeline .timeline__progress .stroke {
        stroke: var(--font-color--2)
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
    .card__middle .objects__timeline .timeline__progress--current span.progress__progress {
        position: absolute;
        font-weight: 600;
        font-size: 14px;
        margin-top: -5px;
        color: var(--font-color--8)
    }
    .card__middle .objects__timeline .timeline__progress--current .fill {
        fill: var(--bg-color--secondary)
    }
    .card__middle .objects__timeline .timeline__progress--current .stroke {
        stroke: var(--bg-color--secondary)
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

    .card__footer .footer__responsible-user, .card__footer .status {
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