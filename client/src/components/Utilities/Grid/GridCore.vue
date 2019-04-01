<template>
    <div class="app-grid">
        <div class="grid__loading" v-if="loading">
            Carregando lista... Aguarde...
        </div>
        <div class="grid__sections">
            <div class="grid__section" v-if="false"></div>
            <div class="grid__section">
                <div class="grid__header" :style="{ left: (- grid.x) + 'px', padding: '0 ' + grid.settings.horizontalPadding + 'px' }">
                    <div class="header__column" v-for="(column, index) in grid.columns" :key="index" :style="[{ 'width': column.width + 'px', 'height': column.height + 'px' }, column.style]">
                        <div v-if="column.name === 'check'" class="check" :class="{active: form.selectedList.length && (form.selectedList.length === grid.rows.length) }" @click="checkAll()"></div>
                        <span v-else>{{ column.text }}</span>
                    </div>
                </div>
                    <app-perfect-scrollbar class="grid__main__container" ref="scrollbar" @ps-scroll-x="xScrollHandler($event)">
                        <div :style="{ height: 0, width: (gridFullWidth + (grid.settings.horizontalPadding * 2)) + 'px', 'min-width': '100%' }">
                            <div class="grid__body">
                                <div class="body__row" v-for="(row, index) in grid.rows" :key="index" :class="{active: _.find(form.selectedList, { id: row.id })}" :style="{ 'height': row.height + 'px' }" @click="rowClick(row)">
                                    <div class="row__column" v-for="(rowColumn, index) in row.columns" :key="index"
                                         :style="[{ width: getColumn(rowColumn.column).width + 'px', 'left': getColumnLeftSpace(rowColumn.column) + 'px' }, rowColumn.style]">
                                        <div v-if="rowColumn.column === 'check'" class="check" :class="{active: _.find(form.selectedList, { id: row.id })}"></div>
                                        <div v-else-if="rowColumn.html">
                                            <slot :name="rowColumn.column" v-bind:row="row"></slot>
                                        </div>
                                        <span :title="rowColumn.showTitle ? (_.isFunction(rowColumn.text) ? rowColumn.text() : rowColumn.text) : ''" v-else>
                                            {{ _.isFunction(rowColumn.text) ? rowColumn.text() : rowColumn.text }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </app-perfect-scrollbar>
            </div>
            <div class="grid__section" v-if="false"></div>
        </div>
        <div class="grid__summary" v-if="hasDefaultSlot">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import {  mapState } from 'vuex';

    import _ from 'lodash'

    import Scrollbar from 'smooth-scrollbar'

    export default {
        props: ['columns', 'rows', 'value', 'loading'],
        data(){
            return {
                form: {
                    selectedList: []
                },
                grid: {
                    columns: [],
                    rows: [],
                    settings: {
                        horizontalPadding: 10
                    },
                    x: 0,
                    y: 0
                }
            }
        },
        watch: {
            value(selectedList){
                this.form.selectedList = _.map(selectedList, (selectedItem) => {
                    return selectedItem
                })
            },
            columns: {
                handler(columns){
                    this.grid.columns = _.map(columns, (column) => {
                        return _.assign({
                            name: 'column',
                            width: 200,
                            height: 40,
                            text: "Coluna",
                            style: {},
                            html: false,
                            pinned: false
                        }, column)
                    })
                    this.grid.columns.unshift({
                        name: 'check',
                        style: {},
                        width: 50,
                        height: 40,
                        html: false
                    })
                },
                immediate: true
            },
            rows: {
                handler(rows){
                    this.grid.rows = _.map(rows, (row) => {
                        const rowColumns = _.map(row.columns, (rowColumn) => {
                            return _.assign({
                                column: rowColumn.column,
                                html: false,
                                text: '---',
                                style: {},
                                showTitle: false
                            }, rowColumn)
                        })
                        rowColumns.unshift({
                            column: 'check',
                            style: {},
                            html: false
                        })
                        return _.assign({ height: 40}, row, {
                            columns: rowColumns
                        })
                    })
                    this.reload()
                },
                immediate: true
            }
        },
        computed: {
            ...mapState(['mainContentArea']),
            hasDefaultSlot(){
                return !!this.$slots.default
            },
            gridFullWidth(){
                return _.sumBy(this.grid.columns, 'width')
            }
        },
        methods: {
            async reload(){
                const vm = this
                if(this.$refs.scrollbar){
                    await this.$nextTick()
                    vm.$refs.scrollbar.update()
                }
            },
            getColumn(columnName){
                return _.find(this.grid.columns, { name: columnName })
            },
            getColumnLeftSpace(columnName){
                const index = _.findIndex(this.grid.columns, { name: columnName })
                let leftSum = this.grid.settings.horizontalPadding
                _.forEach(this.grid.columns,(column, _index) => {
                    if(_index < index) leftSum += column.width
                })
                return leftSum
            },
            rowClick(row){
                this.check(row)
            },
            check(row){
                const index = _.findIndex(this.form.selectedList,{id: row.id})
                if(index !== -1){
                    this.form.selectedList.splice(index, 1)
                }
                else {
                    this.form.selectedList.push(row)
                }
                this.$emit('input', this.form.selectedList)
            },
            checkAll(){
                if(this.form.selectedList.length && (this.form.selectedList.length === this.grid.rows.length)){
                    this.form.selectedList = []
                }
                else {
                    this.form.selectedList = _.map(this.grid.rows, (row) => {
                        return row
                    })
                }
                this.$emit('input', this.form.selectedList)
            },
            xScrollHandler(ev){
                this.grid.x = ev.target.scrollLeft
            }
        },
        mounted(){}
    }
</script>

<style lang="scss" scoped>
    .app-grid {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;

        background-color: var(--bg-color);
        border-radius: 5px;
        .grid__loading {
            position: absolute;
            z-index: 9;
            top: 6px;
            right: 5px;
            padding: 5px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #197379CC;
            color: #FFF
        }
    }
    .grid__sections {
        display: flex;
        flex-direction: column;
        min-width: 100%;
        flex-grow: 1;
        .grid__section {
            display: flex;
            flex-direction: row;
            position: relative;
            flex-grow: 1;
            .grid__header {
                display: flex;
                flex-direction: row;
                text-align: left;
                flex-shrink: 0;
                min-width: 100%;
                position: absolute;
                background-color: var(--bg-color--2);
                z-index: 5;
                .header__column {
                    flex-shrink: 0;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    span {
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                }
            }
            .grid__main__container {
                margin-top: 40px;
                flex-grow: 1;

                .grid__body {
                    position: relative;
                    flex-shrink: 0;
                    padding-bottom: 12px;
                    padding-top: 5px;
                    .body__row {
                        position: relative;
                        border-bottom: 1px solid var(--bg-color--3);
                        width: 100%;
                        cursor: pointer;
                        &:hover, &.active {
                            background-color: rgba(15,15,15,.3)
                        }
                        &:last-child {
                            border-bottom: 0;
                        }
                        .row__column {
                            position: absolute;
                            height: 100%;
                            text-align: left;
                            padding: 10px;
                            overflow: hidden;
                            align-items: center;
                            display: flex;
                            span {
                                text-overflow: ellipsis;
                                overflow: hidden;
                                white-space: nowrap;
                            }

                        }
                    }
                }
            }
        }
    }
    .grid__summary {
        flex-shrink: 0;
    }


    .check {
        width: 14px;
        height: 14px;
        border: 1px solid var(--font-color--7);
        border-radius: 100%;
        background-color: var(--bg-color);
        cursor: pointer;
        &.active {
            border: 1px solid var(--font-color--primary);
            background-color: var(--bg-color--primary);
            border-radius: 100%;
        }
    }

</style>