const LoginRoute = () => import('./features/Auth/Login.vue');
const RegisterRoute = () => import('./features/Auth/Register.vue');
const MainRoute = () => import('./features/Main/Main.vue');
const DashboardRoute = () => import('./features/Main/Dashboard/Dashboard.vue');
const CashierBalancingRoute = () => import('./features/Main/Lists/CashierBalancing/CashierBalancing.vue');

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
                path: 'cashier-balancing',
                component: CashierBalancingRoute,
                meta: {
                    title: 'Caixa / Fechamento diário - GestaON'
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
