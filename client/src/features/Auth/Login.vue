<template>
    <div id="page-login" :style="pageLoginStyle">
        <div class="login-container">
            <div class="left-side">
                <h3>NOVO USUÁRIO?</h3>
                <p>Crie uma nova conta em menos de 2 minutos!</p>
                <div>
                    <router-link to="/register" exact tag="button" class="button is-warning">CRIAR NOVA CONTA</router-link>
                </div>
                <small>* Experimente por 15 dias</small>
            </div>
            <div class="right-side">
                <h3>ENTRAR</h3>
                <form autocomplete="off">
                    <div class="columns">
                        <div class="column">
                            <p class="control">
                                <label class="label">E-mail</label>
                                <input type="email" class="input" placeholder="email@dominio.com.br" autocomplete="false" v-model="form.email" >
                            </p>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <p class="control">
                                <label class="label">Senha</label>
                                <input type="password" class="input" placeholder="*******" v-model="form.password" >
                            </p>
                        </div>
                    </div>
                    <div class="columns" style="margin-top: 0px;">
                        <div class="column">
                            <p class="control">
                                <button class="button is-primary" @click.prevent="login">ENTRAR</button>
                            </p>
                        </div>
                    </div>
                </form>
                <small><a href="#">Esqueci minha senha</a></small>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import oAuthAPI from '../../api/oauth';

    export default {
        data(){
            return {
                form: {
                    email: "",
                    password: ""
                },
                pageLoginStyle: {
                    background: "#26272E"
                }
            }
        },
        computed: {
            ...mapState('auth', [
                'authenticated'
            ])
        },
        methods: {
            ...mapActions('auth', [
                'authenticate'
            ]),
            ...mapActions('loading', [
                'setLoadingText','startLoading', 'stopLoading'
            ]),
            ...mapActions('toast',['showToast']),
            login(){
                const vm = this;
                vm.setLoadingText("Tentando realizar o login...");
                vm.startLoading();
                vm.authenticate(this.form).then((result) => {
                    vm.setLoadingText("Sucesso! Aguarde...");
                    setTimeout(() => {
                        if(this.authenticated){
                            vm.$router.replace("/");
                        }
                    }, 1000);
                }).catch((error) => {
                    console.log(error);
                    vm.stopLoading();
                    vm.showToast({
                        type: 'error',
                        message: error.data.message
                    });
                });
            }
        },
        mounted(){
            if(window.isAppLoading()) {
                window.removeAppLoading();
            }
        }
    }
</script>

<style scoped>
</style>
