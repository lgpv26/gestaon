const LoginRoute = () => import('./features/Auth/Login.vue');
const RegisterRoute = () => import('./features/Auth/Register.vue');
const MainRoute = () => import('./features/Main/Main.vue');
const DashboardRoute = () => import('./features/Main/Dashboard/Dashboard.vue');
const TestRoute = () => import('./features/Main/Test/Test.vue');
const ClientsRoute = () => import('./features/Main/Lists/Clients/Clients.vue');
const CashierBalancingRoute = () => import('./features/Main/Lists/CashierBalancing/CashierBalancing.vue');
const CreditBillsRoute = () => import('./features/Main/Lists/CreditBills/CreditBills.vue');
const RequestsRoute = () => import('./features/Main/Lists/Requests/Requests.vue');
const CompaniesRoute = () => import('./features/Main/Companies/Companies.vue');

export default [
    {
        path: '/login',
        component: LoginRoute,
        meta: {
            title: 'Login - GestaON'
        }
    },
    {
        path: '/register',
        component: RegisterRoute,
        meta: {
            title: 'Criar nova conta - GestaON'
        }
    },
    {
        path: '/',
        component: MainRoute,
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: DashboardRoute,
                meta: {
                    title: 'Painel de pedidos - GestaON'
                }
            },
            {
                path: 'clients',
                component: ClientsRoute,
                meta: {
                    title: 'Clientes - GestaON'
                }
            },
            {
                path: 'cashier-balancing',
                component: CashierBalancingRoute,
                meta: {
                    title: 'Caixa / Fechamento diário - GestaON'
                }
            },
            {
                path: 'credit-bills',
                component: CreditBillsRoute,
                meta: {
                    title: 'Notinhas - GestaON'
                }
            },
            {
                path: 'test',
                component: TestRoute,
                meta: {
                    title: 'Testes - GestaON'
                }
            },
            {
                path: 'requests',
                component: RequestsRoute,
                meta: {
                    title: 'Atendimentos - GestaON'
                }
            },
            {
                path: 'companies',
                component: CompaniesRoute,
                meta: {
                    title: 'Empresas - GestaON'
                }
            },
            {
                path: '*',
                redirect: '/dashboard'
            }
        ]
    },
    {
        path: '*',
        redirect: '/dashboard'
    }
]
