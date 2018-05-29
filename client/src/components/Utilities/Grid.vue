<template>
    <div class="items-list" ref="itemsList">
        <div class="items-loading" v-if="internalLoading || loading">
            Carregando lista... Aguarde...
        </div>
        <div class="no-results" v-if="!items.length">
            Ops... Nenhum registro encontrado... Tente com outra combinação do(s) filtro(s).
        </div>
        <div class="items-list__columns">
            <div class="column" :style="{ width: columnWidths[0] + 'px'}"></div>
            <div class="column" v-for="(column, index) in columns" :style="{ width: columnWidths[index + 1] + 'px' }">
                {{ column.text }}
            </div>
        </div>
        <div class="items-list__container" ref="scrollbar">
            <div class="container__scroll-filler" ref="scrollFiller" :style="{height: scrollFillerHeight + 'px'}">
                <table ref="table">
                    <tbody ref="tbody">
                        <tr v-for="item in items" :class="{active: _.find(form.selectedItems, { id: item.id })}">
                            <td style="width: 30px;" ref="checkTdEl">
                                <div class="check" :class="{active: _.find(form.selectedItems, { id: item.id })}" @click="check(item)"></div>
                            </td>
                            <td v-for="column in columns" :ref="column.name + 'TdEls'">
                                <div v-if="!_.has(column,'html')" class="column-row" @click="check(item)">
                                    {{ getItemColumnValue(item, column) }}
                                </div>
                                <div v-else style="display: flex;">
                                    <slot :name="column.name" v-bind:item="item">
                                    </slot>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="items-list--summary" v-if="hasDefaultSlot">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../utils/index'
    import moment from 'moment'
    import _ from 'lodash'

    import Scrollbar from 'smooth-scrollbar'
    import ResizeSensor from 'css-element-queries/src/ResizeSensor'

    export default {
        props: ['value', 'total', 'columns', 'items', 'loading'],
        data(){
            return {
                internalLoading: false,
                form: {
                    selectedItems: []
                },
                columnWidths: [],
                rowHeight: 0,
                scrollFillerHeight: 0,

                scrollbarStopTimeout: null,
                scrollbar: null,
                resizeSensor: null
            }
        },
        watch: {
            total(){
                this.calculateScrollFiller()
            },
            value(selectedItems){
                this.form.selecteditems = selectedItems
            }
        },
        computed: {
            hasDefaultSlot(){
                return !!this.$slots.default
            },
            getItemColumnValue(){
                return (item, column) => {
                    return item[column.name]
                }
            }
        },
        methods: {
            check(item){
                const selectedItemIndex = _.findIndex(this.form.selectedItems, { id: item.id })
                if(selectedItemIndex !== -1){
                    this.form.selectedItems.splice(selectedItemIndex, 1)
                }
                else {
                    this.form.selectedItems.push(item)
                }
                this.$emit('input', this.form.selectedItems)
            },

            calculateScrollPosition(ev = false){

                let currentScrollPercentage,
                    visibleAreaHeight = 0,
                    visibleItems = 0

                if(this.$refs.scrollbar && this.$refs.scrollbar.clientHeight) {
                    visibleAreaHeight = this.$refs.scrollbar.clientHeight
                }
                visibleItems = (visibleAreaHeight / 40)

                if(!ev && this.$refs.table) {
                    currentScrollPercentage = 0
                    this.$refs.table.style.top = '0px'
                }
                else {
                    currentScrollPercentage = ev.offset.y / (ev.limit.y + visibleAreaHeight)
                    if(this.$refs.table){
                        this.$refs.table.style.top = ev.offset.y + 'px'
                    }
                }

                const firstItemOnScreenPosition = this.total * currentScrollPercentage

                this.$emit('scroll', {
                    from: firstItemOnScreenPosition,
                    to: firstItemOnScreenPosition + visibleItems
                })

                setTimeout(() => {
                    this.calculateColumns()
                }, 100)

            },
            calculateColumns(){
                this.columnWidths = []
                const checkEl = _.first(this.$refs['checkTdEl'])
                if(checkEl){
                    this.columnWidths.push(checkEl.clientWidth)
                    this.columns.forEach((column) => {
                        const currentColumnEl = _.first(this.$refs[column.name + 'TdEls'])
                        this.columnWidths.push(currentColumnEl.clientWidth)
                    })
                }
            },
            calculateScrollFiller(){
                this.scrollFillerHeight = this.total * 40
                this.scrollbar.update(true)
            },
            setResizeListeners(){
                const vm = this
                setImmediate(() => {
                    if(this.resizeSensor) this.resizeSensor.detach()
                    this.resizeSensor = new ResizeSensor(vm.$refs.table, () => {
                        vm.calculateColumns()
                    })
                })
            }
        },
        mounted(){
            const vm = this
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
            this.scrollbar.addListener((ev) => {
                vm.internalLoading = true
                if(vm.scrollbarStopTimeout){
                    clearTimeout(vm.scrollbarStopTimeout)
                }
                vm.scrollbarStopTimeout = setTimeout(() => {
                    vm.internalLoading = false
                    vm.calculateScrollPosition(ev)
                }, 50)
            })
            this.calculateColumns()
            this.setResizeListeners()
            this.calculateScrollFiller()
            this.calculateScrollPosition(false)
        }
    }
</script>

<style scoped>
    div.items-loading {
        position: absolute;
        z-index: 2;
        top: 5px;
        right: 5px;
        padding: 5px 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(20,20,20,.5);
    }

    div.no-results {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-color);
    }

    div.items-list {
        display: flex;
        flex-grow: 1;
        background-color: var(--bg-color);
        padding: 0 0 20px;
        border-radius: 5px;
        flex-direction: column;
        position: relative;
    }

    div.items-list .container__scroll-filler {
        width: 100%;
    }

    div.items-list .items-list__columns {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
        margin-bottom: 10px;
        align-items: center;
        padding: 20px 20px 0 20px;
    }

    div.items-list .items-list__columns .column {
        white-space: nowrap;
        text-align: left;
        font-weight: 600;
        color: var(--font-color--2);
        text-transform: uppercase;
    }

    div.items-list .items-list__container{
        margin: 0 20px 0 20px;
    }

    div.items-list table {
        width: 100%;
        text-align: left;
    }

    table thead th {
        padding: 0 0 10px;
        text-transform: uppercase;
        font-weight: 600;
        color: var(--font-color)
    }

    table tbody tr {
        cursor: pointer;
    }

    table tbody td {
        border-bottom: 1px solid var(--border-color--1);
        height: 40px;
        font-weight: 600;
        color: var(--font-color--7);
    }

    table tbody td .column-row {
        display: flex;
        height: 100%;
        align-items: center;
    }

    table tbody tr.active .column-row {
        color: var(--font-color--primary)
    }

    table tbody tr:hover {
        cursor: pointer;
    }

    table tbody tr:hover td {
        color: var(--font-color--primary)
    }

    table tbody tr:hover .check {
    }

    .check {
        width: 12px;
        height: 12px;
        border: 1px solid var(--font-color--7);
        border-radius: 100%;
        background-color: var(--bg-color)
    }

    .check.active {
        width: 12px;
        height: 12px;
        border: 1px solid var(--font-color--primary);
        background-color: var(--bg-color--primary);
        border-radius: 100%;
    }

    div.items-list .items-list--summary {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
        padding: 20px 20px 0;
        border-top: 1px solid var(--bg-color--8);
        margin-top: 20px;
    }

</style>