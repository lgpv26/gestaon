<template>
    <div class="app-morph-screen" v-show="isShowing" ref="morphScreen" @click="onOverlayClick($event)">
        <a class="morph-screen__close btn" v-if="!activeMorphScreen" @click="closeMorphScreen()">
            Fechar
        </a>
        <div class="morph-screen__wrapper" ref="morphScreenWrapper">
            <div class="morph-screen__item" v-for="screen in screens" ref="morphScreenItems" :key="screen.draft.draftId">
                <div class="item__option" v-show="!screen.active" @click="selectDraft(screen)">
                    <h3 class="option__title">
                        {{ getDraftDetails(screen.draft).formatedCreatedAt }}:
                        <span style="color: #FFF; font-weight: 600; font-size: 16px;">{{ getDraftDetails(screen.draft).createdBy }}</span> criou rascunho
                        <span style="color: #FFF; font-weight: 600; font-size: 16px;">#{{screen.draft.draftId}}</span>
                    </h3>
                </div>
                <transition name="fade">
                    <div class="morph-screen__container" v-if="screen.active" ref="container">
                        <app-draft :details="getDraftDetails(screen.draft)" :screen="screen" @closeDraft="closeDraft()" @closeMorphScreen="closeMorphScreen($event)"></app-draft>
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
    import moment from 'moment';
    import Scrollbar from 'smooth-scrollbar';

    import Draft from "./Draft/Draft.vue";

    export default {
        components: {
            "app-draft": Draft
        },
        data(){
            return {
                scrollbar: null,
                contentEl: null,
                isAnimating: false
            }
        },
        watch: {
            isShowing(isShowing){
                if(isShowing){
                    if(!this.activeMorphScreen){
                        this.animateToMorphScreen();
                    }
                    else {
                        this.animateToDraft();
                    }
                }
            }
        },
        sockets: {
            draftCreated(socketData){
                if(socketData.emittedBy !== this.user.id){
                    this.ADD_DRAFT(socketData.data)
                }
            },
            version(ev){
                if(ev.success && (this.app.version !== ev.evData.webApp)){
                    location.reload(true)
                }
            }
        },
        computed: {
            ...mapGetters('morph-screen', ['activeMorphScreen']),
            ...mapState('morph-screen', ['screens','sourceEl','isShowing','sourceElBgColor','mimicBorderRadius']),
            ...mapState('auth', [
                'user', 'token', 'company'
            ]),
            ...mapState('data/users', [
                'users'
            ]),
            ...mapState(['app'])
        },
        methods: {
            ...mapMutations('morph-screen', ['SET_ALL_MS_SCREENS','SET_MS','SHOW_MS', 'ADD_DRAFT', 'REMOVE_DRAFT']),
            ...mapActions('morph-screen', ['createMorphScreen']),
            ...mapActions('loading', ['startLoading','setLoadingText']),

            getDraftDetails(draft){
                let createdUserName
                if(!_.isString(draft.createdBy)){
                    createdUserName = _.find(this.users, {id: draft.createdBy}).name
                }
                else {
                    createdUserName = draft.createdBy
                }

                switch(draft.type){
                    case "request":
                        return {
                            text: "Pedido",
                            entryComponent: 'request-form',
                            createdBy: createdUserName,
                            formatedCreatedAt: moment(draft.createdAt).format('HH:mm'),
                        }
                        break;
                    case "client":
                        return {
                            text: "Cliente",
                            entryComponent: 'client-form',
                            formatedCreatedAt: moment(draft.createdAt).format('DD/MM HH:mm')
                        }
                        break;
                    case "accounts":
                        return {
                            text: "Plano de contas",
                            entryComponent: 'accounts-form',
                            formatedCreatedAt: moment(draft.createdAt).format('DD/MM HH:mm')
                        }
                        break;
                    case "expense":
                        return {
                            text: "Compras e despesas",
                            entryComponent: 'expense-form',
                            formatedCreatedAt: moment(draft.createdAt).format('DD/MM HH:mm')
                        }
                        break;
                }
            },

            animateToDraft(){
                const vm = this;
                vm.isAnimating = true;
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
                        vm.selectDraft(screenToBeActivated, true);
                    });
                })
            },
            closeDraft(){
                const vm = this;
                const allAnimationsCompleted = [];
                let activeScreenIndex = vm.screens.indexOf(vm.activeMorphScreen)
                setImmediate(() => {
                    vm.SET_MS({
                        draftId: vm.activeMorphScreen.draft.draftId,
                        screen: {
                            active: false
                        }
                    })
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
                return Promise.all(allAnimationsCompleted).then(() => {
                    vm.$refs.morphScreen.style.overflowY = 'overlay';
                    return true
                })
            },
            selectDraft(screen, ignoreAnimating = false){
                const vm = this;
                if(!ignoreAnimating && vm.isAnimating) return;
                vm.isAnimating = true;
                const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                const allAnimationsCompleted = [];
                let activeScreenIndex = vm.screens.indexOf(screen);
                this.$refs.morphScreen.style.overflowY = 'hidden';
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
                            scale: [1, 2],
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
                        /*vm.setLoadingText("Carregando rascunho...");
                        vm.startLoading();*/

                        vm.SET_MS({
                            draftId: screen.draft.draftId,
                            screen: {
                                active: true
                            }
                        })

                        vm.isAnimating = false;
                    }, 300);
                });
            },

            animateToMorphScreen(){
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
                }).finished.then(() => {
                    vm.$refs.morphScreen.style.overflowY = 'overlay';
                });
            },

            /**
             * If screen param is defined, close the draftScreen too
             * @param options:Object
             */
            closeMorphScreen(params = {}){
                const vm = this;
                vm.contentEl.classList.remove('unfocused');
                const animation = anime.timeline().add({
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
                })
                if(!_.has(params,'draftId') && !params.draftId){
                    animation.add({
                        targets: vm.$refs.morphScreen.querySelectorAll('.morph-screen__item'),
                        duration: 300,
                        elasticity: 0,
                        offset: 0,
                        easing: 'easeInOutExpo',
                        opacity: [1, 0],
                        height: ['50px', '30px']
                    })
                }
                animation.finished.then(() => {
                    vm.SHOW_MS(false)
                    if(_.has(params,'draftId') && params.draftId){
                        vm.SET_MS({
                            draftId: params.draftId,
                            screen: {
                                active: false
                            }
                        })
                        if(params.remove){
                            vm.REMOVE_DRAFT(params.draftId)
                        }
                    }
                })
            },

            /**
             * Close morph screen if the overlay was been clicked directly
             * @param ev
             */
            onOverlayClick(ev){
                if(ev.target === this.$refs.morphScreen) this.closeMorphScreen()
            },

            calculateActiveDraftHeight(){
                const vm = this;
                if(vm.activeMorphScreen){
                    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                    let activeScreenIndex = vm.screens.indexOf(vm.activeMorphScreen);
                    vm.$refs.morphScreenItems[activeScreenIndex].style.height = windowHeight + 'px';
                }
            }
        },
        created(){
            const vm = this
            vm.$options.sockets['draft.remove'] = (ev) => {
                console.log("Received draft.remove", ev)
                if(ev.success){
                    if(ev.evData.emittedBy !== vm.user.id){
                        vm.REMOVE_DRAFT(ev.evData.draftId)
                    }
                }
            }
        },
        mounted(){
            this.contentEl = document.getElementById('content');
            window.addEventListener('resize', this.calculateActiveDraftHeight);
        },
        beforeDestroy(){
            if(this.activeMorphScreen){
                this.closeMorphScreen()
            }
            window.removeEventListener('resize', this.calculateActiveDraftHeight);
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
        z-index: 10000;
        background: rgba(0,0,0,.4);
        display: flex;
        flex-direction: column;
        overflow-y: overlay;
        justify-content: center;
    }

    .morph-screen__close {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000000;
    }

    .morph-screen__wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }

    .morph-screen__item {
        display: flex;
        background: var(--bg-color--8);
        flex-shrink: 0;
        margin: 10px 0;
        width: 100%;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-transform: translate3d(0, 0, 0);
        -webkit-transform: translateZ(0);
        transform: translateZ(0); /*for older browsers*/
        will-change: transform;
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
        width: 80%;
        position: absolute;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-self: flex-start;
        padding: 0 10px;
    }
    .morph-screen__container .container__header {
        display: flex;
        flex-direction: row;
        padding: 0 20px;
        height: 112px;
        flex-shrink: 0;
        align-items: center;
    }
    .container__header {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
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
        border-bottom: 1px dashed var(--bg-color--9);
        margin-left: 15px;
        cursor: pointer;
        margin-right: 5px;
        color: var(--font-color--8);
        font-weight: 600;
    }
    .container__header .header__tags ul li:hover > span {
        color: var(--font-color--primary);
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
        font-size: 10px;
        font-weight: 800;
        color: var(--font-color--10);
    }

    /* containers */

    .morph-screen__container .container__body {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        background-color: var(--bg-color--5);
        overflow-y: auto;
        box-shadow: 1px 3px 5px rgba(0,0,0,0.4);
        border-radius: 5px;
    }

</style>
