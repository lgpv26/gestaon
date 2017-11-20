<template>
    <div class="app-morph-screen" v-show="isShowing" ref="morphScreen">
        <a class="morph-screen__close" @click="close()">
            Fechar
        </a>
        <div class="morph-screen__wrapper" ref="morphScreenWrapper">
            <div class="morph-screen__item" v-for="screen in screens" ref="morphScreenItems" :key="screen.draftId">
                <div class="item__option" v-show="!screen.active" @click="itemSelected(screen)">
                    <h3 class="option__title">{{ screen.draftId }}</h3>
                </div>
                <transition name="fade">
                    <div class="morph-screen__container" v-if="screen.active" ref="container">
                        <div class="container__header">
                            <div class="header__summary">
                                <h1 class="summary__title" ref="title">{{ activeMorphScreen.name }}</h1>
                                <span class="summary__info">Iniciado às xx:xx por xxx</span>
                            </div>
                            <span class="push-both-sides"></span>
                            <div class="header__tags">
                                <ul>
                                    <li>Junho</li>
                                    <li>(44) 3268-5858</li>
                                </ul>
                            </div>
                            <div class="header__actions">
                                <a @click="backToMorphScreen()">B</a>
                                <a @click="closeScreen(screen)">X</a>
                            </div>
                        </div>
                        <div class="container__body">
                            <app-request-form></app-request-form>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import _ from 'lodash';
    import anime from 'animejs';

    import RequestForm from "./Request/RequestForm.vue";
    /*import CompanyFormComponent from "../../components/Forms/CompanyForm.vue";
    import UserFormComponent from "../../components/Forms/UserForm.vue";
    import DeviceFormComponent from "../../components/Forms/DeviceForm.vue";
    import OnMapLoadFormComponent from "../../components/Forms/OnMapLoadForm.vue";
    import GeofenceFormComponent from "../../components/Forms/GeofenceForm.vue";*/

    export default {
        components: {
            "app-request-form": RequestForm
            /*"app-company-form": CompanyFormComponent,
            "app-user-form": UserFormComponent,
            "app-device-form": DeviceFormComponent,
            "app-on-map-load-form": OnMapLoadFormComponent,
            "app-geofence-form": GeofenceFormComponent*/
        },
        data(){
            return {
                animation: null,
                contentEl: null,
                selectedContent: null,
                windowResizeEventListener: null
            }
        },
        watch: {
            isShowing(isShowing){
                if(isShowing) this.animateMorphScreen();
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('morph-screen', ['screens','sourceEl','isShowing','sourceElBgColor','mimicBorderRadius']),
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
            ...mapMutations('morph-screen', ['setAllMorphScreens','setMorphScreen','showMorphScreen']),
            animateMorphScreen(){
                const vm = this;
                vm.setAllMorphScreens({
                    active: false
                });
                this.$refs.morphScreenItems.forEach((morphScreen) => {
                    morphScreen.style.height = 70 + 'px';
                    morphScreen.style.opacity = 1;
                    morphScreen.style.transform = 'scale(1)';
                    morphScreen.style.marginTop = '10px';
                    morphScreen.style.marginBottom = '10px';
                    const morphScreenOptionTitle = _.first(morphScreen.getElementsByClassName('option__title'));
                    morphScreenOptionTitle.style.transform = 'scale(1)';
                });
                vm.contentEl.classList.add('unfocused');
                anime.timeline().add({
                    targets: vm.contentEl,
                    duration: 100,
                    scale: .95,
                    offset: 0,
                    easing: 'easeOutSine'
                }).add({
                    targets: vm.$refs.morphScreen,
                    duration: 200,
                    offset: 0,
                    easing: 'easeInOutSine',
                    opacity: {
                        value: [0, 1]
                    }
                }).add({
                    targets: vm.$refs.morphScreen.querySelectorAll('.morph-screen__item'),
                    duration: 200,
                    elasticity: 0,
                    offset: 100,
                    easing: 'easeInOutExpo',
                    opacity: [0, 1],
                    height: ['30px', '70px']
                });
            },
            itemSelected(screen){
                const vm = this;
                const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                const allAnimationsCompleted = [];
                let activeScreenIndex = vm.screens.indexOf(screen);
                this.$refs.morphScreenItems.forEach((morphScreen, morphScreenIndex) => {
                    if(activeScreenIndex === morphScreenIndex){
                        allAnimationsCompleted.push(anime.timeline().add({
                            targets: morphScreen,
                            duration: 300,
                            height: ['70px', windowHeight + 'px'],
                            offset: 0,
                            easing: 'easeInOutSine'
                        }).add({
                            targets: _.first(morphScreen.getElementsByClassName('option__title')),
                            duration: 500,
                            scale: [1, 2.5],
                            offset: 0,
                            easing: 'easeOutSine'
                        }).finished);
                    }
                    else {
                        allAnimationsCompleted.push(anime({
                            targets: morphScreen,
                            duration: 300,
                            opacity: 0,
                            scale: 0,
                            height: 0,
                            offset: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            easing: 'easeInOutSine'
                        }));
                    }
                });
                Promise.all(allAnimationsCompleted).then(() => {
                    setTimeout(() => {
                        vm.setMorphScreen(_.assign({}, screen, { active: true }));

                    }, 300);
                });
            },
            backToMorphScreen(){
                const vm = this;
                const allAnimationsCompleted = [];
                let activeScreenIndex = vm.screens.indexOf(vm.activeMorphScreen);
                setImmediate(() => {
                    vm.setMorphScreen(_.assign({}, vm.activeMorphScreen, { active: false }));
                    const title = _.first(this.$refs.morphScreenItems[activeScreenIndex].getElementsByClassName('option__title'));
                    anime({
                        targets: title,
                        duration: 200,
                        scale: [0, 1],
                        opacity: [0, 1],
                        easing: 'easeInOutSine'
                    }).finished.then(() => {
                        this.$refs.morphScreenItems.forEach((morphScreen, morphScreenIndex) => {
                            if(activeScreenIndex === morphScreenIndex){
                                allAnimationsCompleted.push(anime.timeline().add({
                                    targets: morphScreen,
                                    duration: 300,
                                    height: '70px',
                                    offset: 0,
                                    easing: 'easeInOutSine'
                                }).add({
                                    targets: _.first(morphScreen.getElementsByClassName('option__title')),
                                    duration: 500,
                                    scale: 1,
                                    offset: 0,
                                    easing: 'easeOutSine'
                                }).finished);
                            }
                            else {
                                allAnimationsCompleted.push(anime({
                                    targets: morphScreen,
                                    duration: 300,
                                    opacity: 1,
                                    scale: 1,
                                    height: '70px',
                                    marginTop: 10 + 'px',
                                    marginBottom: 10 + 'px',
                                    easing: 'easeInOutSine'
                                }));
                            }
                        });
                    })
                });
                Promise.all(allAnimationsCompleted).then(() => {
                    /*setTimeout(() => {
                        vm.setMorphScreen(_.assign({}, screen, { active: true }));
                        vm.$refs.morphScreenItems[activeScreenIndex].classList.add('active');
                    }, 300);
                    */
                });
            },
            closeScreen(screen){
                const vm = this;
                let activeScreenIndex = vm.screens.indexOf(screen);
                vm.contentEl.classList.remove('unfocused');
                anime.timeline().add({
                    targets: vm.contentEl,
                    duration: 100,
                    scale: 1,
                    offset: 0,
                    elasticity: 0,
                    easing: 'easeInSine'
                }).add({
                    targets: vm.$refs.morphScreen,
                    duration: 300,
                    offset: 0,
                    elasticity: 0,
                    easing: 'easeInOutSine',
                    opacity: {
                        value: [1, 0]
                    }
                }).finished.then(() => {
                    vm.showMorphScreen(false);
                    vm.setMorphScreen(_.assign({}, screen, { active: false }));
                });
            },
            close(){
                const vm = this;
                vm.contentEl.classList.remove('unfocused');
                vm.animation = anime.timeline();
                vm.animation.add({
                    targets: vm.contentEl,
                    duration: 100,
                    scale: 1,
                    offset: 0,
                    easing: 'easeInSine'
                }).add({
                    targets: vm.$refs.morphScreen,
                    duration: 300,
                    offset: 0,
                    easing: 'easeInOutSine',
                    opacity: {
                        value: [1, 0]
                    }
                }).add({
                    targets: vm.$refs.morphScreen.querySelectorAll('.morph-screen__item'),
                    duration: 300,
                    elasticity: 0,
                    offset: 0,
                    easing: 'easeInOutExpo',
                    opacity: [1, 0],
                    height: ['70px', '30px']
                });
                vm.animation.finished.then(() => {
                    vm.showMorphScreen(false);
                });
            },
            calculateActiveMorphScreenHeight(){
                const vm = this;
                if(vm.activeMorphScreen){
                    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                    let activeScreenIndex = vm.screens.indexOf(vm.activeMorphScreen);
                    vm.$refs.morphScreenItems[activeScreenIndex].style.height = windowHeight + 'px';
                }
            }
        },
        mounted(){
            this.contentEl = document.getElementById('content');
            window.addEventListener('resize', this.calculateActiveMorphScreenHeight);
        },
        beforeDestroy(){
            this.close();
            window.removeEventListener('resize', this.calculateActiveMorphScreenHeight);
        }
    }
</script>

<style>
    .fade-enter-active {
        transition: all .3s ease;
    }
    .fade-leave-active {
        transition: all .3s;
    }
    .fade-enter, .fade-leave-to
        /* .slide-fade-leave-active below version 2.1.8 */ {
        transform: translateX(10px);
        opacity: 0;
    }
    div.app-morph-screen {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 999999;
        background: rgba(0,0,0,.4);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .morph-screen__close {
        position: absolute;
        top: 15px;
        right: 15px;
    }

    .morph-screen__wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .morph-screen__item {
        display: flex;
        background: var(--bg-color-5-l);
        flex-shrink: 0;
        margin: 10px 0;
        width: 100%;
    }

    .morph-screen__item .item__option {
        align-self: center;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .morph-screen__item .item__option h3 {
        font-weight: 600;
        color: var(--primary-color);
        font-size: 18px;
    }

    .morph-screen__container {
        width: 1200px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-self: flex-start;
    }
    .morph-screen__container .container__header {
        display: flex;
        flex-direction: row;
        padding: 30px;
        background-color: var(--bg-color-7);
    }
    .container__header .header__summary .summary__title {
        line-height: 120%;
    }
    .container__header .header__tags {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .container__header .header__tags ul {
        display: flex;
        flex-direction: row;
    }
    .container__header .header__tags ul li {
        padding: 8px 12px;
        background-color: var(--bg-color-6);
        border-radius: 20px;
        border: 1px dashed var(--bg-color-9);
        margin-left: 15px;
        color: var(--base-color);
        cursor: pointer;
    }
    .container__header .header__actions {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 40px;
    }
    .container__header .header__actions > a {
        font-size: 48px;
        line-height: 100%;
        color: var(--danger-color);
        position: relative;
    }
    .morph-screen__container .container__body {
        display: flex;
        flex-direction: column;
        background-color: var(--bg-color-4);
    }
</style>
