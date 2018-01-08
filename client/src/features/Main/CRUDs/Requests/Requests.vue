<template>
    <app-crud-base-layout :title="'Lista de atendimentos'" :columns="columns" :items="items">
        <li><a class="btn btn--border-only">Últimos 30 dias <div class="dot-separator primary" style="margin: 0 10px;"></div> <span class="primary">1214</span></a></li>
        <li><a class="btn btn--border-only">Operação</a></li>
        <li><a class="btn btn--border-only">Grupo</a></li>
        <li><a class="btn btn--border-only">Canal</a></li>
        <li>
            <a class="btn btn--border-only">
                <icon-flag style="margin-right: 10px;"></icon-flag>
                Responsável
                <div class="dot-separator secondary" style="margin: 0 10px;"></div>
                <span class="secondary">2</span>
            </a>
        </li>
        <li>
            <a class="btn btn--border-only">
                <icon-status style="margin-right: 10px;"></icon-status>
                Status
                <div class="dot-separator terciary" style="margin: 0 10px;"></div>
                <span class="terciary">3</span>
            </a>
        </li>
    </app-crud-base-layout>
</template>

<script>
    import { mapMutations, mapGetters, mapState, mapActions } from 'vuex';

    import utils from '../../../../utils/index';
    import moment from 'moment';
    import _ from 'lodash';

    import CRUDBaseLayout from '../_Shared/CRUDBaseLayout.vue'

    export default {
        data(){
            return {
                items: [
                    {
                        id: 1,
                        date: '26/04/1994 18:00',
                        client: 'THIAGO ROCHA',
                        operation: 'VENDA',
                        group: 'DISK VAREJO',
                        channel: 'TELE ENTREGA',
                        status: 'ENVIADO',
                        responsible: 'THIAGO',
                        price: 'R$ 75,00'
                    },
                    {
                        id: 2,
                        date: '26/04/1994 18:00',
                        client: 'THIAGO ROCHA',
                        operation: 'VENDA',
                        group: 'DISK VAREJO',
                        channel: 'TELE ENTREGA',
                        status: 'ENVIADO',
                        responsible: 'THIAGO',
                        price: 'R$ 75,00'
                    },
                    {
                        id: 4,
                        date: '26/04/1994 18:00',
                        client: 'THIAGO ROCHA',
                        operation: 'VENDA',
                        group: 'DISK VAREJO',
                        channel: 'TELE ENTREGA',
                        status: 'ENVIADO',
                        responsible: 'THIAGO',
                        price: 'R$ 75,00'
                    }
                ],
                columns: [
                    {
                        text: 'Nº',
                        name: 'id',
                    },
                    {
                        text: 'Data/Hora',
                        name: 'date',
                    },
                    {
                        text: 'Cliente',
                        name: 'client',
                    },
                    {
                        text: 'Operação',
                        name: 'operation',
                    },
                    {
                        text: 'Grupo',
                        name: 'group',
                    },
                    {
                        text: 'Canal',
                        name: 'channel',
                    },
                    {
                        text: 'Status',
                        name: 'status',
                    },
                    {
                        text: 'Responsável',
                        name: 'responsible',
                    },
                    {
                        text: 'Valor',
                        name: 'price',
                    }
                ]
            }
        },
        components: {
            'app-crud-base-layout': CRUDBaseLayout
        }
    }
</script>

<style scoped>
</style>
