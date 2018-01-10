<template>
    <app-crud-base-layout :title="'Lista de clientes'" :columns="columns" :items="items">
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
        components: {
            'app-crud-base-layout': CRUDBaseLayout
        },
        data(){
            return {
                items: [
                    {
                        id: 1,
                        name: 'THIAGO YOITHI',
                        address: 'RUA 28 DE JUNHO, 1214',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 2,
                        name: 'ACIMAR ROCHA',
                        address: 'RUA 28 DE JUNHO, 1214',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 3,
                        name: 'THAIS THIEMI ROCHA',
                        address: 'RUA 28 DE JUNHO, 1214',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 4,
                        name: 'TÂNIA ROCHA',
                        address: 'RUA 28 DE JUNHO, 1214',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 5,
                        name: 'SILÇO',
                        address: 'RUA SÃO CRISTÓVÃO, 911',
                        date: '10/12/2017 15:05:20'
                    },
                    {
                        id: 6,
                        name: 'DANIEL LALA',
                        address: 'RUA SÃO CRISTÓVÃO, 911',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 7,
                        name: 'PANIFICADORA MONTE FUJI',
                        address: 'AVENIDA RIACHUELO, 622',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 8,
                        name: 'CARLINHOS',
                        address: 'AVENIDA DOUTOR ALEXANDRE RASGULAEFF, 98',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 9,
                        name: 'MERCADO DA ESQUINA',
                        address: 'AVENIDA TUIUTI, 2144',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 10,
                        name: 'BIDU LANCHES',
                        address: 'AVENIDA GUAIAPÓ, 8',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 11,
                        name: 'DONA MARIA',
                        address: 'RUA CARLOS POPPI, 125',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 12,
                        name: 'COZINHA DO PAPAI',
                        address: 'RUA 28 DE JUNHO, 1021',
                        date: '26/12/2017 12:20:43'
                    },
                    {
                        id: 13,
                        name: 'MARILONES',
                        address: 'RUA DO MARILON, ??',
                        date: '26/12/2017 12:20:43'
                    }
                ],
                columns: [
                    {
                        text: 'Nº',
                        name: 'id',
                    },
                    {
                        text: 'Nome',
                        name: 'name'
                    },
                    {
                        text: 'Endereço',
                        name: 'address'
                    },
                    {
                        text: 'Data de registro',
                        name: 'date',
                    }
                ]
            }
        }
    }
</script>

<style scoped>
    .page--list {
        display: flex;
        flex-grow: 1;
        justify-content: center;
    }
    .page--list > div {
        width: 1200px;
        text-align: center;
        padding-top: 40px;
    }
</style>
