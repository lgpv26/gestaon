<template>
    <div class="request-board-card">
        <div class="request-board-card__container">
            <div class="card__header">
                <h3 class="card__client-name" data-card-tippy v-tippy="RBCClientTippyOptions">{{ card.request.client.name }}</h3>
                <h3 class="card__order" data-card-tippy v-tippy="RBCOrderTippyOptions">{{ utils.formatMoney(orderSubtotal, 2,'R$ ','.',',') }}</h3>
            </div>
            <h3 class="card__task" v-if="hasTaskInstruction">{{ card.request.task.text }}</h3>
            <h3 class="card__task--add" v-else @click="onAddTaskClick()">+ Incluir Tarefa ou Anotação</h3>
            <div class="card__middle">
                <div class="card__timer">
                    <div class="timer__objects">
                        <div class="objects__timer">
                            <span class="timer__hours">{{ hours }}</span>
                            <span class="timer__minutes">{{ minutes }}</span>
                            <request-board-icon-timer></request-board-icon-timer>
                        </div>
                        <div class="objects__timeline">
                            <div class="timeline__progress" v-for="(requestTimelineItem, index) in requestTimeline"
                                 ref="requestTimelineProgressEls" data-card-tippy v-tippy="getRBCProgressTippyOptions(requestTimelineItem.data.id)">
                                <span class="progress__progress" v-if="requestTimelineItem.current">{{ timeUntilNow }}</span>
                                <span class="progress__progress" v-else>{{ requestTimelineItem.time }}</span>
                                <request-board-icon-progress-shield></request-board-icon-progress-shield>
                            </div>
                        </div>
                        <div class="objects__deadline" ref="deadline" data-card-tippy v-tippy="RBCDeadlineTippyOptions" v-show="timeUntilNow !== '?'">
                            <span class="deadline__time">{{ (timeUntilNow < settings.deadlineInMinutes) ? settings.deadlineInMinutes : timeUntilNow }}</span>
                            <span class="deadline__label">min</span>
                        </div>
                        <div class="objects__deadline" style="display: flex; align-items: center; justify-content: center; font-weight: 600;" v-show="timeUntilNow === '?'">
                            ...
                        </div>
                    </div>
                    <div class="timer__line"></div>
                </div>
            </div>
            <div class="card__footer">
                <span class="footer__location" ref="footerLocation" data-card-tippy v-tippy="RBCLocationTippyOptions">
                    <request-board-icon-location></request-board-icon-location> Local
                </span>
                <span class="push-both-sides"></span>
                <a class="footer__status ignore" v-tippy="RBCStatusTippyOptions"><request-board-icon-status></request-board-icon-status> {{ status }}</a>
                <a class="footer__responsible-user ignore" v-tippy="RBCUserTippyOptions"><request-board-icon-flag></request-board-icon-flag> {{ responsibleUserName }}</a>
            </div>
            <app-rbc-location id="rbc-location" :card="card"></app-rbc-location>
            <app-rbc-client id="rbc-client" :card="card"></app-rbc-client>
            <app-rbc-order id="rbc-order" :card="card"></app-rbc-order>
            <app-rbc-progress v-for="(requestTimelineItem, index) in requestTimeline" :key="requestTimelineItem.data.id"
            :card="card" :requestTimelineItem="requestTimelineItem"
            :id="'rbc-progress' + '-' + requestTimelineItem.data.id"></app-rbc-progress>
            <app-rbc-deadline id="rbc-deadline" :card="card"></app-rbc-deadline>
            <app-rbc-status id="rbc-status" :cardId="card.id" v-model="form.status"></app-rbc-status>
            <app-rbc-user id="rbc-user" :cardId="card.id" v-model="form.userId"></app-rbc-user>
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
                handler(newValue, oldValue){
                    this.setForm()
                    this.recalculateTimeline(newValue)
                },
                deep: true
            }
        },

        sockets: {
            requestBoardRequestTimelineChangeUser(ev){
                if(ev.success && ev.evData.cardId === this.card.id){
                    console.log("Received requestBoardRequestTimelineChangeUser", ev.evData)
                    const card = utils.removeReactivity(this.card)
                    card.request.requestTimeline.push(ev.evData.requestTimelineItem)
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
                    this.updateCard({
                        cardId: this.card.id,
                        card
                    })
                }
            }
        },
        data(){
            return {
                form: {
                    status: null,
                    userId: null
                },
                timeUntilNow: '?',
                requestTimeline: [],
                requestTimelineInterval: null,
                RBCStatusTippyOptions: {
                    html: '#rbc-status',
                    trigger: 'mouseenter',
                    hideOnClick: false,
                    placement: 'bottom-start',
                    theme: 'erp-dark',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                },
                RBCUserTippyOptions: {
                    html: '#rbc-user',
                    trigger: 'mouseenter',
                    hideOnClick: false,
                    placement: 'bottom-start',
                    theme: 'erp-dark',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                },
                RBCLocationTippyOptions: {
                    html: '#rbc-location',
                    delay: 500,
                    hideOnClick: false,
                    placement: 'top-start',
                    theme: 'erp',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                },
                RBCClientTippyOptions: {
                    html: '#rbc-client',
                    delay: 500,
                    hideOnClick: false,
                    placement: 'bottom',
                    theme: 'erp',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                },
                RBCOrderTippyOptions: {
                    html: '#rbc-order',
                    delay: 500,
                    hideOnClick: false,
                    placement: 'bottom',
                    theme: 'erp',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                },
                RBCDeadlineTippyOptions: {
                    html: '#rbc-deadline',
                    delay: 500,
                    hideOnClick: false,
                    placement: 'bottom-end',
                    theme: 'erp',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective',
                    distance: 0
                },
                settings: {
                    deadlineInMinutes: 30
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
            hours(){
                return moment(this.card.request.dateCreated).format("HH")
            },
            minutes(){
                return moment(this.card.request.dateCreated).format("mm")
            },
            status(){
                switch(this.form.status){
                    case "pending":
                        return "Pendente"
                        break;
                    case "sent":
                        return "Enviado"
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
                    id: this.form.userId
                })
                if(responsibleUser)
                    return responsibleUser.name
                else
                    return '---'
            }
        },
        methods: {
            ...mapActions('request-board',['updateCard']),
            setForm(){
                this.form.userId = _.last(this.card.request.requestTimeline).userId
                this.form.status = _.last(this.card.request.requestTimeline).status
            },
            recalculateTimeline(requestTimeline){
                this.requestTimeline = _.map(requestTimeline, (data) => {
                    return {
                        data
                    }
                })
                this.requestTimeline = _.sortBy(this.requestTimeline, function(requestTimelineItem) {
                    return requestTimelineItem.data.dateCreated;
                })
            },
            onAddTaskClick(){
                console.log(this.card)
            },
            getRBCProgressTippyOptions(requestTimelineId){
                return {
                    html: '#rbc-progress-' + requestTimelineId,
                    delay: 500,
                    hideOnClick: false,
                    placement: 'bottom',
                    theme: 'erp',
                    interactive: true,
                    reactive : true,
                    duration: 100,
                    inertia: true,
                    arrow: true,
                    animation: 'perspective'
                }
            }
        },
        mounted(){
            const vm = this
            vm.setForm()
            vm.recalculateTimeline(vm.card.request.requestTimeline)
            vm.requestTimelineInterval = setInterval(() => {
                vm.requestTimeline.forEach((requestTimelineItem, index) => {
                    const requestTimelineProgressEl = vm.$refs.requestTimelineProgressEls[index]
                    const lastRequestTimelineItem = _.last(vm.requestTimeline)
                    if(lastRequestTimelineItem.data.id === requestTimelineItem.data.id){ // if this is the current time object
                        if(lastRequestTimelineItem.data.status !== 'finished'){
                            const startDate = moment(vm.card.request.dateCreated)
                            const endDate = moment(vm.card.request.deadlineDatetime)
                            const nowDate = moment()
                            const diffUntilNowInSec = moment.duration(nowDate.diff(startDate)).asSeconds()
                            _.assign(requestTimelineItem, {
                                current: true,
                                time: diffUntilNowInSec,
                            })
                            const total = moment.duration(endDate.diff(startDate)).asSeconds()
                            const percentage = (diffUntilNowInSec/total) * 100;
                            let leftInPxs = 200 // max left in pixels, of the progress bar
                            if (percentage < 100) {
                                leftInPxs = (leftInPxs * percentage) / 100
                                requestTimelineProgressEl.style.left = leftInPxs + 'px'
                                requestTimelineProgressEl.classList.remove('timeline__progress')
                                requestTimelineProgressEl.classList.add('timeline__progress--current')
                                requestTimelineProgressEl.style.visibility = 'initial'
                            }
                            else { // if over 100%
                                requestTimelineProgressEl.style.visibility = 'hidden'
                                const deadlineEl = vm.$refs.deadline
                                deadlineEl.classList.add('over')
                            }
                            const diffUntilNowInMin = Math.floor(diffUntilNowInSec / 60)
                            if (diffUntilNowInMin > 99) {
                                vm.timeUntilNow = "99+"
                            } else if(diffUntilNowInMin < 0){
                                vm.timeUntilNow = 0
                            }
                            else {
                                vm.timeUntilNow = diffUntilNowInMin
                            }
                        }
                        else { // if finished
                            const startDate = moment(vm.card.request.dateCreated)
                            const endDate = moment(vm.card.request.dateCreated).add(vm.settings.deadlineInMinutes, 'm')
                            const nowDate = moment(lastRequestTimelineItem.data.dateCreated)
                            const diffUntilNowInSec = moment.duration(nowDate.diff(startDate)).asSeconds()
                            const total = moment.duration(endDate.diff(startDate)).asSeconds()
                            const percentage = (diffUntilNowInSec/total) * 100;
                            let leftInPxs = 200 // max left in pixels, of the progress bar

                            requestTimelineProgressEl.style.visibility = 'hidden'
                            const deadlineEl = vm.$refs.deadline
                            const diffUntilNowInMin = Math.floor(diffUntilNowInSec / 60)
                            if(diffUntilNowInMin > vm.settings.deadlineInMinutes){
                                deadlineEl.classList.add('over')
                            }
                            else {
                                deadlineEl.classList.add('in-time')
                            }
                            if (diffUntilNowInMin > 99) {
                                vm.timeUntilNow = "99+"
                            } else {
                                vm.timeUntilNow = diffUntilNowInMin
                            }
                        }
                    }
                    else { // previous time objects
                        if(requestTimelineItem.data.action !== 'create'){
                            if (requestTimelineProgressEl.classList.contains('timeline__progress--current')) {
                                requestTimelineProgressEl.classList.remove('timeline__progress--current')
                                requestTimelineProgressEl.classList.add('timeline__progress')
                            }
                            requestTimelineProgressEl.style.visibility = 'initial'
                            const startDate = moment(vm.card.request.dateCreated)
                            const endDate = moment(vm.card.request.deadlineDatetime)
                            const nowDate = moment(requestTimelineItem.data.dateCreated)
                            const diffUntilNowInSec = moment.duration(nowDate.diff(startDate)).asSeconds()
                            const diffUntilNowInMin = Math.floor(diffUntilNowInSec / 60)
                            _.assign(requestTimelineItem, {
                                current: false,
                                time: diffUntilNowInMin,
                            })
                            const total = moment.duration(endDate.diff(startDate)).asSeconds()
                            const percentage = (diffUntilNowInSec / total) * 100;
                            let leftInPxs = 200 // max left in pixels, of the progress bar
                            if (percentage < 100) {
                                leftInPxs = (leftInPxs * percentage) / 100
                                requestTimelineProgressEl.style.left = leftInPxs + 'px'
                            }
                            else {
                                requestTimelineProgressEl.style.visibility = 'hidden'
                            }
                        }
                    }
                })
            }, 300)
        },
        beforeDestroy(){
            clearInterval(this.requestTimelineInterval)
        }
    }
</script>

<style>
    .request-board-card {
        display: flex;
        background: var(--bg-color--2);
        box-shadow: var(--card-shadow);
    }

    .request-board-card__container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 10px;
        text-align: center;
        max-width: 100%;
    }

    .request-board-card .card__header {
        display: flex;
        flex-direction: row;
        justify-content: center
    }

    .request-board-card .card__header h3.card__order {
        font-size: 14px;
        margin-left: 5px;
        color: var(--font-color--primary)
    }

    .request-board-card h3.card__client-name {
        color: var(--font-color--7);
        font-size: 14px;
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
        visibility: hidden;
        align-items: center;
        justify-content: center;
        z-index: 1;
        transition: all 0.5s ease;
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
        transition: all 0.5s ease;
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
        color: var(--font-color)
    }

    .card__footer a {
        font-weight: 600;
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

</style>