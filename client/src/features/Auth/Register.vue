<template>
    <div id="page-login" :style="pageLoginStyle">
        <div class="login-container">
            <div class="left-side">
                <h3>JÁ POSSUI CONTA?</h3>
                <div>
                    <router-link to="/login" exact tag="button" class="button is-warning">ENTRAR COM CONTA EXISTENTE</router-link>
                </div>
            </div>
            <div class="right-side">
                <h3>CRIAR NOVA CONTA</h3>
                <form autocomplete="off">
                    <div class="columns">
                        <div class="column">
                            <p class="control">
                                <label class="label">Seu nome</label>
                                <input type="text" class="input" placeholder="" autocomplete="false" v-model="form.name" >
                            </p>
                        </div>
                    </div>
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
                        <div class="column">
                            <p class="control">
                                <label class="label">Confirme a senha</label>
                                <input type="password" class="input" placeholder="*******" v-model="form.confirmPassword" >
                            </p>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <p class="control">
                                <label class="label">Nome da Empresa</label>
                                <input type="text" class="input" placeholder="" autocomplete="false" v-model="form.companyName" />
                                <small>** deixe em branco no caso de cadastro de pessoa física, você poderá editar esta configuração posteriormente.</small>
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
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        data(){
            return {
                form: {
                    name: null,
                    email: null,
                    password: null,
                    companyName: null
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
                this.setLoadingText("Tentando realizar o login...");
                this.startLoading();
                this.authenticate(this.form)
                    .then(()=>{
                        this.setLoadingText("Sucesso! Aguarde...");
                        setTimeout(() => {
                            if(this.authenticated){
                                vm.$router.replace("/");
                            }
                        }, 1000);
                    }, (error) => {
                        console.log("Erro");
                        console.log(error);
                        this.stopLoading();
                        this.showToast({
                            type: 'error',
                            message: error.data.message
                        });
                        console.error(error.data.message);
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
