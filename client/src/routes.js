const LoginRoute = () => import('./features/Auth/Login.vue');
const RegisterRoute = () => import('./features/Auth/Register.vue');
const MainRoute = () => import('./features/Main/Main.vue');
const TrackerRoute = () => import('./features/Main/Tracker/Tracker.vue');
const UsersRoute = () => import('./features/Main/Users/Users.vue');
const CompaniesRoute = () => import('./features/Main/Companies/Companies.vue');

export default [
    {
        path: '/login',
        component: LoginRoute,
        meta: {
            title: 'Login - Agiliza.me'
        }
    },
    {
        path: '/register',
        component: RegisterRoute,
        meta: {
            title: 'Criar nova conta - Agiliza.me'
        }
    },
    {
        path: '/',
        component: MainRoute,
        children: [
            {
                path: 'tracker',
                component: TrackerRoute,
                meta: {
                    title: 'GPS - Agiliza.me'
                }
            },
            {
                path: 'users',
                component: UsersRoute,
                meta: {
                    title: 'Usuários - Agiliza.me'
                }
            },
            {
                path: 'companies',
                component: CompaniesRoute,
                meta: {
                    title: 'Empresas - Agiliza.me'
                }
            },
            {
                path: '*',
                redirect: '/tracker'
            }
        ]
    },
    {
        path: '*',
        redirect: '/tracker'
    }
]
