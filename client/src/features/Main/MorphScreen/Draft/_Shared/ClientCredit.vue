<template>
    <app-popover v-bind="popoverProps">
        <template slot="triggerer">
            <slot></slot>
        </template>
        <template slot="content">
            <div style="display: flex; flex-direction: column; width: 380px;">
                <div class="credit-limit-container">
                    <h3>Limite de crédito</h3>
                    <div class="form">
                        <money v-model="form.creditLimit"></money>
                        <a class="btn btn--primary">Salvar</a>
                    </div>
                </div>
                <div class="credit-bills-container">
                    <h3>Notinhas pendentes</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Data de vencimento</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Código</td>
                                <td>00/00/2018 10:00</td>
                                <td>Status</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </app-popover>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex'
    import _ from 'lodash'
    import utils from '@/utils/index'
    import Vue from 'vue'

    export default {
        props: ['value', 'popoverProps'],
        data(){
            return {
                form: {
                    creditLimit: 0
                }
            }
        },
        computed: {
        },
        methods: {
        }
    }
</script>

<style lang="scss" scoped>
    .credit-limit-container {
        flex-grow: 1;
        margin-bottom: 20px;
        input {
            margin-right: 8px;
            width: 120px;
        }
        .form {
            display: flex;
            flex-direction: row;
        }
    }

    .credit-limit-container:last-child {
        margin-bottom: 0
    }

    .credit-bills-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        table {
            th {
                text-align: left;
            }
        }
    }

    h3 {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--d-secondary);
        margin-bottom: 10px;
    }
</style>
