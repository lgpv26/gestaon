<template>
    <div class="page--crud">
        <div>
            <h3 class="title">{{ title }}</h3>
            <ul class="filter-menu">
                <slot></slot>
            </ul>
            <div class="items-list">
                <div class="items-list__container" ref="scrollbar">
                    <table ref="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th v-for="column in columns">
                                    {{ column.text }}
                                </th>
                            </tr>
                        </thead>
                        <tbody ref="tbody">
                            <tr v-for="item in items">
                                <td style="width: 30px;">
                                    <div class="check"></div>
                                </td>
                                <td v-for="column in columns">
                                    {{ getItemColumnValue(item, column) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="footer">
                <div class="left-side">
                    <span>Com selecionado:</span>
                    <a>Imprimir recibo</a>
                    <div class="dot-separator"></div>
                    <a>Emitir nota fiscal</a>
                    <div class="dot-separator"></div>
                    <a>Abrir em detalhe</a>
                </div>
                <span class="push-both-sides"></span>
                <div class="right-side">
                    <span>Exportar relatório:</span>
                    <a>Analítico</a>
                    <div class="dot-separator primary"></div>
                    <a>Sintético</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';
    import Clusterize from 'clusterize.js'

    import Scrollbar from 'smooth-scrollbar'
    import ResizeSensor from 'css-element-queries/src/ResizeSensor'

    export default {
        props: ['title', 'columns', 'items'],
        data(){
            return {
                scrollbar: null,
                resizeSensor: null
            }
        },
        computed: {
            getItemColumnValue(){
                return (item, column) => {
                    return item[column.name]
                }
            }
        },
        methods: {
            updateResizeListeners(){
                const vm = this
                setImmediate(() => {
                    if(this.resizeSensor) this.resizeSensor.detach()
                    this.resizeSensor = new ResizeSensor(vm.$refs.table, () => {
                        console.log("Mudou de tamanho")
                    })
                })
            }
        },
        mounted(){
            this.scrollbar = Scrollbar.init(this.$refs.scrollbar, {
                overscrollEffect: 'bounce',
                alwaysShowTracks: true
            })
            this.updateResizeListeners()
            /*this.clusterize = new Clusterize({
                scrollElem: this.$refs.scrollbar,
                contentElem: this.$refs.tbody,
                callbacks: {
                    clusterWillChange: function() {
                        console.log("clusterWillChange")
                    },
                    clusterChanged: function() {
                        console.log("clusterChanged")
                    },
                    scrollingProgress: function(progress) {
                        console.log("scrollingProgress", progress)
                    }
                }
            });*/
        }
    }
</script>

<style scoped>

    .page--crud {
        display: flex;
        flex-grow: 1;
        justify-content: center;
        background-color: var(--bg-color--7)
    }
    .page--crud > div {
        width: 1200px;
        text-align: center;
        padding-top: 40px;
        display: flex;
        flex-direction: column;
    }
    .page--crud > div > h3 {
        padding-bottom: 30px;
    }
    h3.title {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--7)
    }
    ul.filter-menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
    }
    ul.filter-menu li {
        margin: 0 5px;
    }
    ul.filter-menu li a {
        height: 32px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: var(--font-color--7)
    }
    ul.filter-menu li a .primary {
        color: var(--font-color--primary);
        font-weight: 600;
    }
    ul.filter-menu li a .dot-separator.primary {
        background-color: var(--border-color--primary)
    }
    ul.filter-menu li a .secondary {
        color: var(--font-color--secondary);
        font-weight: 600;
    }
    ul.filter-menu li a .dot-separator.secondary {
        background-color: var(--border-color--secondary)
    }
    ul.filter-menu li a .terciary {
        color: var(--font-color--terciary);
        font-weight: 600;
    }
    ul.filter-menu li a .dot-separator.terciary {
        background-color: var(--border-color--terciary)
    }

    div.items-list {
        display: flex;
        flex-grow: 1;
        background-color: var(--bg-color);
        padding: 20px;
        border-radius: 5px;
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
        padding: 10px 0;
        font-weight: 600;
        color: var(--font-color--7);
    }

    table tbody tr:hover {
        cursor: pointer;
    }

    table tbody tr:hover td {
        color: var(--font-color--primary)
    }

    table tbody tr:hover .check {
        border-color: var(--border-color--primary)
    }

    .check {
        width: 12px;
        height: 12px;
        border: 1px solid var(--font-color--7);
        border-radius: 100%;
    }

    div.footer {
        padding: 40px 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.footer a {
        text-transform: uppercase;
    }

    div.footer span {
        font-weight: 600;
    }

    div.footer .left-side {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding-left: 20px;
    }

    div.footer .left-side > * {
        margin: 0 5px;
    }

    div.footer .right-side {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding-right: 20px;
    }

    div.footer .right-side > * {
        margin: 0 5px;
    }

    div.footer .right-side > *:last-child {
        margin: 0 0 0 5px;
    }

    div.footer .right-side a {
        color: var(--font-color--7);
    }
</style>
