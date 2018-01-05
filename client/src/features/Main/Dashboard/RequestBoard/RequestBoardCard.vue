<template>
    <div class="request-board-card">
        <div class="request-board-card__container">
            <h3 class="card__client-name" data-card-tippy v-tippy="RBCClientTippyOptions">{{ card.request.client.name }}</h3>
            <h3 class="card__task" v-if="hasTaskInstruction">{{ card.request.task.text }}</h3>
            <h3 class="card__task--add" v-else>+ Incluir Tarefa ou Anotação</h3>
            <div class="card__middle">
                <div class="card__timer">
                    <div class="timer__objects">
                        <div class="objects__timer">
                            <span class="timer__hours">09</span>
                            <span class="timer__minutes">51</span>
                            <request-board-icon-timer></request-board-icon-timer>
                        </div>
                        <div class="objects__timeline">
                            <div class="timeline__progress" data-card-tippy v-tippy="getRBCProgressTippyOptions(0)">
                                <span class="progress__progress" >07</span>
                                <request-board-icon-progress-shield></request-board-icon-progress-shield>
                            </div>
                            <div class="timeline__progress--current" data-card-tippy v-tippy="getRBCProgressTippyOptions(1)">
                                <span class="progress__progress">17</span>
                                <request-board-icon-progress-shield></request-board-icon-progress-shield>
                            </div>
                        </div>
                        <div class="objects__deadline" data-card-tippy v-tippy="RBCDeadlineTippyOptions">
                            <span class="deadline__time">30</span>
                            <span class="deadline__label">min</span>
                        </div>
                    </div>
                    <div class="timer__line"></div>
                </div>
            </div>
            <div class="card__footer">
                <span class="footer__location" ref="footerLocation" data-card-tippy v-tippy="RBCLocationTippyOptions">
                    <request-board-icon-location></request-board-icon-location> 4,3 km
                </span>
                <span class="push-both-sides"></span>
                <a><request-board-icon-status></request-board-icon-status> Pendente</a>
                <a><request-board-icon-flag></request-board-icon-flag> Cintia</a>
            </div>
            <app-rbc-location id="rbc-location"></app-rbc-location>
            <app-rbc-client id="rbc-client"></app-rbc-client>
            <app-rbc-progress v-for="(progress, index) in progresses" :key="index" :id="'rbc-progress' + '-' + index"></app-rbc-progress>
            <app-rbc-progress id="rbc-deadline"></app-rbc-progress>
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

    import RBCLocation from './RequestBoardCard/RBCLocation.vue'
    import RBCClient from './RequestBoardCard/RBCClient.vue'
    import RBCProgress from './RequestBoardCard/RBCProgress.vue'

    export default {
        props: ['card','isDragging'],
        components: {
            'app-rbc-location': RBCLocation,
            'app-rbc-client': RBCClient,
            'app-rbc-progress': RBCProgress
        },
        data(){
            return {
                progresses: [{}, {}],
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
                }
            }
        },
        computed: {
            hasTaskInstruction(){
                return _.has(this.card, 'request.task.text')
            }
        },
        methods: {
            getRBCProgressTippyOptions(index){
                return {
                    html: '#rbc-progress-' + index,
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
        }
    }
</script>

<style>
    .request-board-card {
        display: flex;
        background: var(--bg-color);
        box-shadow: var(--card-shadow);
    }

    .request-board-card__container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 10px;
        text-align: center;
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
        left: 40px; /* and goes until 199px */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
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
        align-items: center;
        justify-content: center;
        display: flex;
    }

    .card__middle .deadline__time {
        font-weight: 600;
        position: absolute;
        margin-top: -6px;
        color: var(--font-color--d-secondary);
    }
    .card__middle .deadline__label {
        margin-top: 6px;
        position: absolute;
        font-size: 12px;
        color: var(--font-color--d-secondary);
    }

    .card__middle .objects__deadline.finished-in .deadline__time,
    .card__middle .objects__deadline.finished-in .deadline__label {
        color: var(--font-color--d-primary);
    }

    .card__middle .objects__deadline.out .deadline__time,
    .card__middle .objects__deadline.out .deadline__label {
        color: var(--font-color--danger);
    }

    /* footer */

    .card__footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .card__footer span.footer__location {
        margin: 0;
        color: var(--font-color--2);
        font-weight: 600;
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

</style>