<template>
    <div id="page-login">
        <div class="login__container">
            <div class="container__header">
                <h3>GESTAON ERP</h3>
            </div>
            <div class="container__body">
                <form autocomplete="off">
                    <div>
                        <label>E-mail</label>
                        <input style="display:none;"/>
                        <input type="email" class="input" placeholder="email@dominio.com.br" autocomplete="off" v-model="form.email" >
                    </div>
                    <div>
                        <label>Senha</label>
                        <input style="display:none;"/>
                        <input type="password" class="input" placeholder="*******" autocomplete="off" v-model="form.password" >
                    </div>
                    <div style="margin-top: 20px;">
                        <button class="btn" @click.prevent="login">entrar</button>
                    </div>
                </form>
                <div class="body__action-buttons">
                    <a href="#">esqueci minha senha</a>
                    <!--
                    <router-link to="/register" exact tag="button" class="btn btn--secondary" style="margin-right: 10px;">nova conta</router-link>
                    <button class="btn btn--terciary">esqueci a senha</button>
                    -->
                </div>
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
    #page-login {
        background: transparent url('../../assets/imgs/bg-login.jpg') no-repeat center;
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: fixed;
        overflow-y: overlay;
        align-items: center;
    }

    /* Login Page */
    #page-login input{
        text-transform: uppercase;
        font-size: 24px;
    }

    #page-login input[type=email]{
        text-transform: lowercase;
    }

    #page-login div.login__container {
        background-image: url('../../assets/imgs/bg-login-form.png');
        background-size: cover;
        background-position: center;
        width: 540px;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        box-shadow: 0 0 60px rgba(0,0,0,.4);
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }

    #page-login div.login__container h3 {
        display:none;
        margin: 0;
        text-align: center;
        font-size: 30px;
        font-weight: 600;
    }

    #page-login div.login__container .container__header {
      background-image: url('../../assets/imgs/logo-white.png');
      background-size: cover;
      background-position: center;
      justify-content: center;
      align-items: center;
      width: 241px;
      height:64px;
      color: #FFF;
      text-align: center;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    #page-login div.login__container .container__header h3 {
        color: rgba(255,255,255,0.9);
        text-shadow: 1px 1px #222;
    }

    #page-login div.login__container .container__header .btn {
        margin: 10px 0;
    }

    #page-login div.login__container .container__header small {
        color: rgba(255,255,255,0.7);
    }


    #page-login div.login__container .container__body {
        flex-shrink: 0;
        padding: 40px 30px 20px;
        color: #333;
        text-align: center;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    #page-login div.login__container .container__body form {
        margin-bottom: 20px;
    }

    #page-login div.login__container .container__body form > div {
        margin-bottom: 20px;
        text-align: left;
    }

    #page-login div.login__container .container__body form > div label {
        color: #FFF;
        font-weight: 600;
    }

    #page-login div.login__container .container__body form input.input {
        margin-bottom: 5px;
        border-bottom: 1px solid rgba(255,255,255,.4);
    }

    input.input::-webkit-input-placeholder { /* Chrome/Opera/Safari */
        color: rgba(255,255,255,.5);
    }

    input.input::-moz-placeholder { /* Firefox 19+ */
        color: rgba(255,255,255,.5);
    }
    input.input:-ms-input-placeholder { /* IE 10+ */
        color: rgba(255,255,255,.5);
    }
    input.input:-moz-placeholder { /* Firefox 18- */
        color: rgba(255,255,255,.5);
    }

    #page-login div.login__container .container__body .body__action-buttons {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    #page-login div.login__container .container__body .btn {
        margin: 0;
        width: 100%;
        text-align: center;
        display: flex;
        justify-content: center;
    }

    #page-login div.login__container .container__body a {
        text-align: center;
        color: rgba(255,255,255,.7);
    }

    #page-login .input, #page-login .textarea, #page-login .btn {
        height: 40px;
    }

    #page-login .control small {
        margin-top: 5px;
        font-size: 10px;
        color: #666;
        display: inline-block;
        line-height: 100%;
    }

    .btn {
        box-shadow: 0 0 3px rgba(0,0,0,.4);
        background-color: rgba(255,255,255,.7);
        color: var(--font-color--primary);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 14px;
    }
</style>
