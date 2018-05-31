<template>
    <div>
        <div class="rbc-progress">
            <div class="tooltip-content" v-if="requestTimelineItemData">
                <div v-if="requestTimelineItemData.action === 'create'" style="display: flex; flex-direction: column;">
                    <span>{{ _.find(users, {id: requestTimelineItemData.triggeredBy}).name }} criou o pedido</span>
                    <span>Responsável: {{ _.find(users, {id: requestTimelineItemData.userId}).name }}</span>
                    <span>---</span>
                    <span>Pedido {{ card.request.id }} | Venda: {{ card.request.requestOrder.id }}</span>
                </div>
                <div v-else>
                    <span v-if="requestTimelineItemData.action === 'user_change'">{{ _.find(users, {id: requestTimelineItemData.triggeredBy}).name }} mudou o responsável</span>
                    <span v-else-if="requestTimelineItemData.action === 'status_change'">{{ _.find(users, {id: requestTimelineItemData.triggeredBy}).name }} mudou o status</span>
                    <span v-if="requestTimelineItemData.action === 'user_change'">
                    para {{ _.find(users, {id: requestTimelineItemData.userId}).name }}
                </span>
                    <span v-if="requestTimelineItemData.action === 'status_change'">
                    para {{ requestTimelineItemData.status }}
                </span>
                </div>
            </div>
            <div class="tooltip-actions">
                <span class="push-both-sides"></span>
                <timeago :since="requestTimelineItemData.dateCreated" style="color: var(--font-color--9)" :auto-update="60"></timeago>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import Vue from 'vue'
    import _ from 'lodash'
    import utils from '@/utils'
    import moment from 'moment'

    export default {
        props: ['card','requestTimelineItem'],
        data(){
            return {}
        },
        computed: {
            ...mapState('data/users', ['users']),
            requestTimeDiffInMinutes(){
                const startDate = moment(this.card.request.dateCreated)
                const nowDate = moment(this.requestTimelineItemData.dateCreated)
                const diffUntilNowInSec = moment.duration(nowDate.diff(startDate)).asSeconds()
                return Math.floor(diffUntilNowInSec / 60)
            },
            orderTimeDiffInMinutes(){
                const startDate = moment(this.card.request.requestOrder.dateCreated)
                const nowDate = moment(this.requestTimelineItemData.dateCreated)
                const diffUntilNowInSec = moment.duration(nowDate.diff(startDate)).asSeconds()
                return Math.floor(diffUntilNowInSec / 60)
            },
            requestTimelineItemData(){
                if(_.get(this.requestTimelineItem, 'data', false)){
                    return this.requestTimelineItem.data
                }
            }
        },
        methods: {
        },
        mounted(){
        }
    }
</script>

<style scoped>
    .rbc-progress {
        display: flex;
        flex-direction: column;
        color: var(--font-color--10)
    }
    .tooltip-content {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
        text-align: left;
        min-width: 260px;
    }
    .tooltip-content span {
        font-size: 12px;
        font-weight: 600;
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
    }
</style>