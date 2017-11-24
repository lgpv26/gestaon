<template>
    <div class="app-morph-screen" v-show="isShowing" ref="morphScreen">
        <a class="morph-screen__close" v-if="!activeMorphScreen" @click="close()">
            Fechar
        </a>
        <div class="morph-screen__wrapper" ref="morphScreenWrapper">
            <div class="morph-screen__item" v-for="screen in screens" ref="morphScreenItems" :key="screen.draft.draftId">
                <div class="item__option" v-show="!screen.active" @click="itemSelected(screen)">
                    <h3 class="option__title">{{ screen.draft.draftId }}</h3>
                </div>
                <transition name="fade">
                    <div class="morph-screen__container" v-if="screen.active" ref="container">
                        <div class="container__header">
                            <div class="header__summary">
                                <h1 class="summary__title" ref="title">PEDIDO <span>#{{ screen.draft.draftId }}</span>
                                <icon-log style="margin-left: 3px; position: relative; top: 1px;"></icon-log></h1>
                                <span class="summary__info">Iniciado às <em>xx:xx</em> por <em>xxx</em></span>
                            </div>
                            <span class="push-both-sides"></span>
                            <div class="header__tags">
                                <span>Termos da busca: </span>
                                <ul>
                                    <li><span>Junho</span><icon-copy></icon-copy></li>
                                    <li><span>(44) 3268-5858</span><icon-copy></icon-copy></li>
                                </ul>
                            </div>
                            <div class="header__actions">
                                <div class="actions__draft-menu" @click="backToMorphScreen()">
                                    <div class="count">
                                        <span>{{ screens.length }}</span>
                                    </div>
                                    <icon-draft-list></icon-draft-list>
                                </div>
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

    export default {
        components: {
            "app-request-form": RequestForm
        },
        data(){
            return {
                animation: null,
                contentEl: null,
                selectedContent: null,
                windowResizeEventListener: null
            }
        },
        sockets: {
            draftCreated({data,emittedBy}){
                if(emittedBy !== this.user.id) this.ADD_DRAFT(data);
            }
        },
        watch: {
            isShowing(isShowing){
                if(isShowing){
                    if(!this.activeMorphScreen){
                        this.animateMorphScreen();
                    }
                    else {
                        this.animateMorphScreenDirectlyToDraft();
                    }
                }
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
            ...mapMutations('morph-screen', ['SET_ALL_MS_SCREENS','SET_MS_SCREEN','SHOW_MS', 'ADD_DRAFT']),
            ...mapActions('morph-screen', ['createMorphScreen']),
            animateMorphScreenDirectlyToDraft(){
                const vm = this;
                const screenToBeActivated = vm.activeMorphScreen;
                vm.SET_ALL_MS_SCREENS({
                    active: false
                });
                setImmediate(() => {
                    this.$refs.morphScreenItems.forEach((morphScreen) => {
                        morphScreen.style.height = 50 + 'px';
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
                        height: ['30px', '50px']
                    }).finished.then(() => {
                        vm.itemSelected(screenToBeActivated);
                    });
                })
            },
            animateMorphScreen(){
                const vm = this;
                vm.SET_ALL_MS_SCREENS({
                    active: false
                });
                this.$refs.morphScreenItems.forEach((morphScreen) => {
                    morphScreen.style.height = 50 + 'px';
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
                    height: ['30px', '50px']
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
                            height: ['50px', windowHeight + 'px'],
                            offset: 0,
                            marginTop: 0,
                            marginBottom: 0,
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
                        vm.SET_MS_SCREEN(_.assign({}, screen, { active: true }));
                    }, 300);
                });
            },
            backToMorphScreen(){
                const vm = this;
                const allAnimationsCompleted = [];
                let activeScreenIndex = vm.screens.indexOf(vm.activeMorphScreen);
                vm.$socket.emit('presence-update-draft', {
                    draftId: vm.activeMorphScreen.draft.draftId,
                    userId: vm.user.id,
                    leave: true
                });
                setImmediate(() => {
                    vm.SET_MS_SCREEN(_.assign({}, vm.activeMorphScreen, { active: false }));
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
                                    height: '50px',
                                    offset: 0,
                                    marginTop: 10 + 'px',
                                    marginBottom: 10 + 'px',
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
                                    height: '50px',
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
                        vm.SET_MS_SCREEN(_.assign({}, screen, { active: true }));
                        vm.$refs.morphScreenItems[activeScreenIndex].classList.add('active');
                    }, 300);
                    */
                });
            },
            closeScreen(screen){
                const vm = this;
                vm.$socket.emit('presence-update-draft', {
                    draftId: vm.activeMorphScreen.draft.draftId,
                    userId: vm.user.id,
                    leave: true
                });
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
                    vm.SHOW_MS(false);
                    vm.SET_MS_SCREEN(_.assign({}, screen, { active: false }));
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
                    height: ['50px', '30px']
                });
                vm.animation.finished.then(() => {
                    vm.SHOW_MS(false);
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
        overflow-y: overlay;
        justify-content: center;
    }

    .morph-screen__close {
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 1000000;
        color: var(--primary-color);
        padding: 5px 8px;
        background-color: var(--bg-color-7);
        font-weight: 500;
        border-radius: 8px;
    }

    .morph-screen__wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }

    .morph-screen__item {
        display: flex;
        background: var(--bg-color-5-l);
        flex-shrink: 0;
        margin: 10px 0;
        width: 100%;
    }

    .morph-screen__item .item__option {
        overflow-y: auto;
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
        width: 80%;
        position: absolute;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-self: flex-start;
    }
    .morph-screen__container .container__header {
        display: flex;
        flex-direction: row;
        padding: 0 30px;
        height: 112px;
        flex-shrink: 0;
        align-items: center;
    }
    .container__header .header__summary > .summary__title {
        font-weight: 600;
        line-height: 120%;
        font-size: 14px;
    }

    .container__header .header__summary > .summary__title span {
        color: var(--base-color);
        font-weight: 600;
        font-size: 14px;
    }

    .container__header .header__summary > .summary__info > em {
        font-style: initial;
        color: var(--primary-color);
        font-weight: 600;
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
    .container__header .header__tags ul li > span {
        padding: 5px 2px;
        border-bottom: 1px dashed var(--bg-color-9);
        margin-left: 15px;
        cursor: pointer;
        margin-right: 5px;
        color: var(--primary-color);
        font-weight: 600;
    }
    .container__header .header__tags ul li > svg {
        position: relative;
        top: -5px;
    }
    .container__header .header__actions {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 40px;
    }
    .container__header .header__actions .actions__draft-menu {
        width: 32px;
        height: 32px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .container__header .header__actions .actions__draft-menu .count {
        bottom: -2px;
        left: -2px;
        position: absolute;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        background-color: var(--terciary-color);
        color: #FFF;
        font-weight: 800;
    }

    .container__header .header__actions .actions__draft-menu .count span {
        font-size: 12px;
    }


    .morph-screen__container .container__body {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        background-color: var(--bg-color-5);
        overflow-y: auto;
    }
</style>
