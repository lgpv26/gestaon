<template>
    <div class="board-section" v-show="sectionRequests.length && !isLoading" :style="{ width: sectionWidth }">
        <div class="board-section__header" :style="{ height: options.headerHeight + 'px' }">
            <div class="header__section-title">
                <h3>{{ section.name }}</h3>
                <span class="push-both-sides"></span>
                <ul style="display: flex; flex-direction: row">
                    <li @click="collapseSection(section.id)" style="width: 21px; height: 16px;">
                        <icon-section-collapse></icon-section-collapse>
                    </li>
                    <li @click="expandSection(section.id)" style="width: 21px; height: 16px;">
                        <icon-section-expand></icon-section-expand>
                    </li>
                    <li @mouseover="setLastHoveredSection(section)" class="section-title__settings-button" style="width: 15px; height: 16px;">
                        <app-dropdown-menu :menuList="sectionMenuList" :params="sectionMenuParams" :closeOnSelect="true">
                            <a href="javascript:void(0)" style="display: flex; height: 16px;">
                                <icon-section-settings></icon-section-settings>
                            </a>
                        </app-dropdown-menu>
                    </li>
                </ul>
            </div>
        </div>
        <div class="scrollable-content">
            <app-perfect-scrollbar class="board-section__viewport" :style="{ width: sectionWidth, height: sectionHeight }">
                <div class="board-section__cards" :style="{'padding-bottom': options.gutterSize + 'px','padding-left': options.gutterSize + 'px'}">
                    <div class="request-card" v-for="request in sectionRequests" :key="'request-' + request.id"
                            :style="{ height: options.cardHeight + 'px', width: options.columnWidth + 'px', 'margin-top': options.gutterSize + 'px', 'margin-right': options.gutterSize + 'px' }"
                            @click="cardClick(request, $event)">
                        <app-request-board-card class="request-card__main" :card="request.card" :request="request"></app-request-board-card>
                    </div>
                </div>
            </app-perfect-scrollbar>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from "vuex";
    import DraggableComponent from "vuedraggable";
    import _ from "lodash";
    import shortid from "shortid";

    import RequestBoardDraftCard from "./RequestBoardDraftCard.vue"
    import RequestBoardCard from "./RequestBoardCard.vue"

    import Request from "../../../../vuex/models/Request"

    import Vue from "vue";

    export default {
        components: {
            "app-draggable": DraggableComponent,
            "app-request-board-draft-card": RequestBoardDraftCard,
            "app-request-board-card": RequestBoardCard
        },
        props: ["section", "options"],
        data() {
            return {
                cardDraggableOptions: {
                    handle: ".request-card__main",
                    scroll: false,
                    forceFallback: false,
                    ghostClass: "ghost",
                    group: "cards",
                    filter: ".ignore"
                },
                lastHoveredSection: null,
                lastSectionMove: null,
                lastCardMove: {
                    sectionId: null,
                    from: null,
                    to: null
                },
                sectionMenuParams: {},
                sectionMenuList: [
                    {
                        text: "Remover seção",
                        type: "system",
                        param: {},
                        action: this.removeSection
                    }
                ],
                isDraggingBoardColumn: false,
                isDraggingCard: false
            };
        },
        computed: {
            ...mapState(["mainContentArea"]),
            ...mapState("auth", ["user", "tokens", "company"]),
            ...mapState("morph-screen", { isShowingMorphScreen: "isShowing" }),
            ...mapState("request-board", ["sections", "filters", "isLoading"]),
            sectionWidth() {
                const size = _.get(this.sections, `${this.section.id}.size`, 1);
                return (
                    this.options.gutterSize +
                    (size * this.options.columnWidth +
                        (size + 1) * this.options.gutterSize) +
                    "px"
                );
            },
            sectionHeight() {
                return (
                    this.mainContentArea.height -
                    this.options.headerHeight -
                    this.options.gutterSize * 2 +
                    "px"
                );
            },
            sectionRequests() {
                switch (this.section.id) {
                    case "requests":
                        const requests = Request.query()
                            .with("card.window")
                            .with("client|client.clientAddresses.address")
                            .with(
                                "requestClientAddresses|requestClientAddresses.clientAddress.address"
                            )
                            .with("requestUIState")
                            .with("requestOrder.requestOrderProducts.product")
                            .with("requestPayments.paymentMethod")
                            .where(record => {
                                if(this.utils.isTmp(record.id)){
                                    return true
                                }
                                return this.moment(record.deliveryDate).isSame(this.moment(this.filters.deliveryDate), 'day')
                            })
                            .get();
                        return _.filter(requests, request => {
                            const responsibleUsers =
                                _.get(this.filters, "responsibleUsers", []).length === 0 ||
                                (_.has(request, "userId") &&
                                    _.includes(this.filters.responsibleUsers, request.userId));
                            const clientGroups =
                                _.get(this.filters, "clientGroups", []).length === 0 ||
                                (_.has(request, "client.clientGroupId") &&
                                    _.includes(
                                        this.filters.clientGroups,
                                        request.client.clientGroupId
                                    ));
                            const promotionChannels =
                                _.get(this.filters, "promotionChannels", []).length === 0 ||
                                (_.has(request, "requestOrder.promotionChannelId") &&
                                    _.includes(
                                        this.filters.promotionChannels,
                                        request.requestOrder.promotionChannelId
                                    ))
                            const status =
                                _.get(this.filters, "status", []).length === 0 ||
                                (_.has(request, "status") &&
                                    _.includes(this.filters.status, request.card.status));
                            return (
                                responsibleUsers && promotionChannels && clientGroups && status &&
                                    request.card.status !== 'finished' && request.card.status !== 'canceled'
                            );
                        });
                    case "scheduled":
                        return [];
                }
            }
        },
        methods: {
            ...mapMutations("morph-screen", []),
            ...mapActions("request-board", ["expandSection", "collapseSection"]),
            _evPathPolyfill(ev){
                const path = (ev.composedPath && ev.composedPath()) || ev.path,
                    target = ev.target;
                if (path != null) {
                    // Safari doesn't include Window, but it should.
                    return (path.indexOf(window) < 0) ? path.concat(window) : path;
                }
                if (target === window) {
                    return [window];
                }
                function getParents(node, memo) {
                    memo = memo || [];
                    const parentNode = node.parentNode;

                    if (!parentNode) {
                        return memo;
                    }
                    else {
                        return getParents(parentNode, memo.concat(parentNode));
                    }
                }
                return [target].concat(getParents(target), window)
            },
            cardClick(request, ev) {
                let shouldOpenWindow = true;
                this._evPathPolyfill(ev).forEach(pathItem => {
                    if (pathItem.classList && pathItem.classList.contains("ignore")) {
                        shouldOpenWindow = false;
                    }
                })
                if (shouldOpenWindow && request.card) {
                    this.$store.dispatch("entities/windows/update", {
                        where: request.card.windowId,
                        data: {
                            show: true,
                            zIndex:
                            this.$store.getters["entities/windows/query"]().max("zIndex") + 1
                        }
                    })
                    if(request.requestOrderId){
                        this.$store.dispatch("entities/requestUIState/update", {
                            where: request.requestUIState.id,
                            data: {
                                activeTab: "order"
                            }
                        })
                    }
                }
            },

            /* Sections */

            setLastHoveredSection(section) {
                this.sectionMenuParams.lastHoveredSection = section;
            },
            removeSection(params) {
                console.log("Remoção de seção não está implementado");
            }
        }
    };
</script>

<style>
    .board-section {
        margin: 10px 10px 10px 0;
        padding: 0;
        background: rgba(21, 23, 28, 0.5);
        overflow: hidden;
        flex-shrink: 0;
    }
    .board-section > .board-section__header {
        padding: 10px 10px 8px;
        height: 50px;
        background: var(--bg-color--2);
    }
    .board-section > .board-section__header {
        display: flex;
        color: var(--base-color);
    }
    .board-section > .board-section__header > .header__section-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    .board-section > .board-section__header > .header__section-title > h3 {
        color: var(--font-color--8);
        flex-grow: 1;
        font-size: 14px;
    }
    .board-section > .board-section__header > .header__section-title > ul > li {
        cursor: pointer;
        margin-right: 5px;
    }
    .board-section > .board-section__header > .header__section-title ul li svg {
        pointer-events: none;
    }
    .board-section > .board-section__header > .header__section-title ul li .fill,
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li
    .colorizable {
        fill: var(--font-color--2);
    }
    .board-section > .board-section__header > .header__section-title ul li .stroke {
        stroke: var(--font-color--2);
    }
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li:hover
    .fill,
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li:hover
    .colorizable {
        fill: var(--font-color--primary);
    }
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li:hover
    .stroke {
        stroke: var(--font-color--primary);
    }
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li.section-title__settings-button {
        margin-right: 0;
    }
    .board-section
    > .board-section__header
    > .header__section-title
    ul
    li.section-title__settings-button
    svg {
        position: relative;
        top: 1px;
    }
    .board-section__viewport {
        position: relative;
        overflow: hidden;
        float: left;
    }
    .board-section__viewport .board-section__cards {
        display: flex;
        flex-flow: row wrap;
        min-height: 100%;
        align-content: flex-start;
        width: 100%;
        position: absolute;
        max-width: 100%;
    }
    .board-section__viewport::-webkit-scrollbar {
        background-color: rgba(0, 0, 0, 0.2);
        width: 10px;
    }
    .board-section__viewport::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.7);
        width: 10px;
    }

    /* card */

    .request-card {
        display: flex;
        position: relative;
        z-index: 9;
    }
    .request-card > .request-card__main {
        cursor: pointer;
        flex-grow: 1;
        max-width: 100%;
    }
    .request-card.ghost > .request-card__main {
        border: 2px dashed rgba(255, 255, 255, 0.1);
        opacity: 0.8;
    }
</style>
