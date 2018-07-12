<template>
    <div>
        <div class="rbc-progress">
            <div class="tooltip-content">
                <div style="margin-bottom: 5px;">
                    <span>Entrega: {{ moment(card.deliveryDate).format('DD/MM/YYYY HH:mm') }}</span>
                    <span v-if="card.request.isScheduled">(<i class="mi mi-schedule"></i>)</span>
                </div>
                <div v-if="!deadline.isOver && card.request.status !== 'finished'">
                    <span>O pedido ainda está dentro do prazo!</span>
                </div>
                <div v-else-if="overDeadlineRequestTimeline.length">
                    <div v-for="(overDeadlineTimelineItem, index) in recentFirstOverDeadlineRequestTimeline"
                         v-if="(index === 0 || index === 1 || index === 2) " class="over-deadline-timeline-item">
                        <span v-if="overDeadlineTimelineItem.action === 'user_change'">{{ getUserName(overDeadlineTimelineItem.triggeredBy) }} mudou o responsável</span>
                        <span v-else-if="overDeadlineTimelineItem.action === 'status_change'">{{ getUserName(overDeadlineTimelineItem.triggeredBy) }} mudou o status</span>
                        <span v-if="overDeadlineTimelineItem.action === 'user_change'">
                        para {{ getUserName(overDeadlineTimelineItem.userId) }}
                        </span>
                        <span v-if="overDeadlineTimelineItem.action === 'status_change'">
                            para {{ getStatus(overDeadlineTimelineItem.status) }}
                        </span>
                        <span>
                            às {{ moment(overDeadlineTimelineItem.dateCreated).format("DD/MM/YYYY HH:mm:ss") }}
                        </span>
                    </div>
                    <span v-if="recentFirstOverDeadlineRequestTimeline.length > 3">
                        E mais {{ recentFirstOverDeadlineRequestTimeline.length - 3 }} registro(s)...
                    </span>
                </div>
                <div v-else>
                    <span>Nenhuma mudança de status ocorreu após o vencimento do prazo.</span>
                </div>
                <!--<span>Pedido {{ card.request.id }} | {{ requestTimeDiffInMinutes }} min</span>
                <span>Venda {{ card.request.requestOrder.id }} | {{ orderTimeDiffInMinutes }} min</span>
                <span>---</span>
                <span v-if="requestTimelineItemData.action === 'user_change'">{{ _.find(users, {id: requestTimelineItemData.triggeredBy}).name }} mudou o responsável</span>
                <span v-else-if="requestTimelineItemData.action === 'status_change'">{{ _.find(users, {id: requestTimelineItemData.triggeredBy}).name }} mudou o status</span>
                <span v-if="requestTimelineItemData.action === 'user_change'">
                    para {{ _.find(users, {id: requestTimelineItemData.userId}).name }}
                </span>
                <span v-if="requestTimelineItemData.action === 'status_change'">
                    para {{ requestTimelineItemData.status }}
                </span>
                -->
            </div>
            <div class="tooltip-actions">
                <a href="javascript:void(0)" @click="runRequestRecoverance({ requestId: card.request.id, companyId: company.id })">Editar <icon-edit></icon-edit></a>
                <span class="push-both-sides"></span>
                <timeago :since="card.request.dateCreated" style="color: var(--font-color--9)" :auto-update="60"></timeago>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import _ from 'lodash'

    export default {
        props: ['card','deadline','overDeadlineRequestTimeline'],
        data(){
            return {}
        },
        computed: {
            ...mapState('auth', ['company']),
            ...mapState('data/users', ['users']),
            recentFirstOverDeadlineRequestTimeline(){
                return _.reverse(_.sortBy(this.overDeadlineRequestTimeline, (a) => {
                    return a.dateCreated
                }))
            },
        },
        methods: {
            ...mapActions('draft/request',['runRequestRecoverance']),
            getUserName(userId){
                const user = _.find(this.users, {id: userId})
                if(user){
                    return user.name
                }
                else {
                    return '---'
                }
            },
            getStatus(status){
                switch(status){
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
            }
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
    .tooltip-content .over-deadline-timeline-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }
    .tooltip-content .over-deadline-timeline-item:last-child {
        margin-bottom: 0;
    }
    .tooltip-actions {
        display: flex;
        flex-direction: row;
    }
    .tooltip-actions a {
        font-weight: 600;
    }
</style>