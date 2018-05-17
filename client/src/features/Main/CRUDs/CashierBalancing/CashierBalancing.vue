<template>
    <div class="page--crud">
        <div>
            <h3 class="title">CAIXA - FECHAMENTO DIÁRIO</h3>
            <ul class="filter-menu">
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
            </ul>
            <app-grid :options="options" :columns="columns" :items.sync="items" :total="databaseItems.length" @scroll="onGridScroll($event)">
                <div class="summary__item">
                    <span>Selecionados</span>
                    <h3>02</h3>
                </div>
                <div class="summary__item">
                    <span>Itens da lista</span>
                    <h3>2000</h3>
                </div>
                <div class="summary__item">
                    <span>Saldo acumulado</span>
                    <h3>R$ 12000,00</h3>
                </div>
                <span class="push-both-sides"></span>
                <div class="summary__item border-left" style="flex-direction: row; align-items: flex-start">
                    <span style="margin-right: 10px;">Valor</span>
                    <h3 style="color: var(--font-color--8); font-weight: 400; font-size: 28px; align-self: center;">R$ 2580,00</h3>
                </div>
                <div class="summary__item">
                    <span>Tempo médio</span>
                    <h3>15 min</h3>
                </div>
            </app-grid>
            <div class="footer">
                <div class="left-side" style="padding-left: 0;">
                    <img :src="logoSrc" style="margin-left: 0" />
                </div>
                <span class="push-both-sides"></span>
                <div class="right-side">
                    <div class="group">
                        <span>No horário:</span>
                        <app-datetime-selector class="input--borderless" v-model="deadlineDatetime" @input="inputDeadlineDatetime($event)" :config="datetimeSelectorConfig" placeholder="..."></app-datetime-selector>
                    </div>
                    <div class="group">
                        <span>Com selecionados:</span>
                        <a>Marcar como pago</a>
                    </div>
                    <a class="btn btn--primary">Confirmar</a>
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

    import GridComponent from '../../../../components/Utilities/Grid.vue'
    import { Portuguese } from 'flatpickr/dist/l10n/pt'

    export default {
        components: {
            'app-grid': GridComponent
        },
        data(){
            return {
                logoSrc: require('../../../../assets/imgs/logo-2018.png'),
                options: {
                },
                databaseItems: [
                    {
                        "id": 1,
                        "name": "Oconnor Fisher",
                        "address": "Wyckoff Avenue, 183",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 2,
                        "name": "Juanita Dennis",
                        "address": "Balfour Place, 414",
                        "date": "11/01/2017 21:45",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 3,
                        "name": "Bartlett Ellis",
                        "address": "Charles Place, 714",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 4,
                        "name": "Angelia Walsh",
                        "address": "Mill Road, 967",
                        "date": "17/04/2018 17:20",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 5,
                        "name": "Norma Webster",
                        "address": "Powers Street, 582",
                        "date": "17/04/2018 17:20",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 6,
                        "name": "Cantrell Baxter",
                        "address": "Martense Street, 478",
                        "date": "12/02/2018 15:10",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 7,
                        "name": "Burt Wilkerson",
                        "address": "Sutton Street, 753",
                        "date": "11/01/2017 21:45",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 8,
                        "name": "Mueller Hess",
                        "address": "Sackman Street, 998",
                        "date": "04/09/2017 05:00",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 9,
                        "name": "Jacobs Fowler",
                        "address": "Coffey Street, 339",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 10,
                        "name": "Aisha Long",
                        "address": "Crystal Street, 521",
                        "date": "12/02/2018 15:10",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 11,
                        "name": "Lorna Spence",
                        "address": "Ridge Court, 993",
                        "date": "12/02/2018 15:10",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 12,
                        "name": "Stone Everett",
                        "address": "Irving Place, 336",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 13,
                        "name": "Odessa Frazier",
                        "address": "Dank Court, 990",
                        "date": "11/01/2017 21:45",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 14,
                        "name": "Elba Mosley",
                        "address": "Madeline Court, 603",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 15,
                        "name": "Sweet Livingston",
                        "address": "Suydam Place, 425",
                        "date": "17/04/2018 17:20",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    }
                ],
                items: [
                    {
                        "id": 1,
                        "name": "Oconnor Fisher",
                        "address": "Wyckoff Avenue, 183",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 2,
                        "name": "Juanita Dennis",
                        "address": "Balfour Place, 414",
                        "date": "11/01/2017 21:45",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 3,
                        "name": "Bartlett Ellis",
                        "address": "Charles Place, 714",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 4,
                        "name": "Angelia Walsh",
                        "address": "Mill Road, 967",
                        "date": "17/04/2018 17:20",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 5,
                        "name": "Norma Webster",
                        "address": "Powers Street, 582",
                        "date": "17/04/2018 17:20",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 6,
                        "name": "Cantrell Baxter",
                        "address": "Martense Street, 478",
                        "date": "12/02/2018 15:10",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 7,
                        "name": "Burt Wilkerson",
                        "address": "Sutton Street, 753",
                        "date": "11/01/2017 21:45",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 8,
                        "name": "Mueller Hess",
                        "address": "Sackman Street, 998",
                        "date": "04/09/2017 05:00",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 9,
                        "name": "Jacobs Fowler",
                        "address": "Coffey Street, 339",
                        "date": "13/04/2018 16:34",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
                    {
                        "id": 10,
                        "name": "Aisha Long",
                        "address": "Crystal Street, 521",
                        "date": "12/02/2018 15:10",
                        "clientGroup": "DISK VEREJO",
                        "paymentMethod": "DINHEIRO",
                        "paymentDeadline": "16/05/2018 15:05",
                        "amount": "R$ 75,00",
                        "status": "pending",
                    },
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
                    },
                    {
                        text: 'Grupo Cliente',
                        name: 'clientGroup',
                    },
                    {
                        text: 'Meio de Pagamento',
                        name: 'paymentMethod',
                    },
                    {
                        text: 'Vencimento',
                        name: 'paymentDeadline',
                    },
                    {
                        text: 'Valor',
                        name: 'amount',
                    },
                    {
                        text: 'Status',
                        name: 'status',
                    }
                ],
                deadlineDatetime: null,
                datetimeSelectorConfig: {
                    altInput: true,
                    altFormat: 'd/m/Y H:i:S',
                    dateFormat: 'Z',
                    locale: Portuguese,
                    time_24hr: true,
                    enableTime: true
                },
            }
        },
        methods: {
            onGridScroll(ev){
                this.items = []
                let i = Math.ceil(ev.from)
                while(i < Math.ceil(ev.to) + 1){
                    if(this.databaseItems[i] !== undefined) {
                        this.items.push(this.databaseItems[i])
                    }
                    i++;
                }
            }
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
        width: 96%;
        text-align: center;
        padding-top: 40px;
        display: flex;
        flex-direction: column;
    }
    .page--crud > div > h3 {
        padding-bottom: 30px;
    }

    /* title */

    h3.title {
        font-size: 16px;
        text-transform: uppercase;
        color: var(--font-color--7)
    }

    /* filter */

    ul.filter-menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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

    /* summary */

    .summary__item {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding: 0 20px;
        border-right: 1px solid var(--bg-color--8)
    }

    .summary__item.border-left {
        border-left: 1px solid var(--bg-color--8)
    }

    .summary__item:last-child {
        border-right: 0
    }

    /* footer */

    div.footer {
        padding: 40px 0;
        display: flex;
        flex-shrink: 0;
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

    div.footer .right-side {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding-right: 20px;
    }

    div.footer .right-side .group {
        border: 1px solid var(--bg-color--9);
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 8px 20px;
        border-radius: 10px;
        margin-right: 10px;
    }

    div.footer .right-side .group .dot-separator {
        margin: 0 10px;
    }

    div.footer .right-side .group span {
        margin-right: 10px;
        white-space: nowrap
    }

    div.footer .right-side > * {
        margin: 0 5px;
    }

    div.footer .right-side > *:last-child {
        margin: 0 0 0 5px;
    }
</style>