<template>
    <div class="app-morph-screen" v-if="isShowing" ref="morphScreen">
        <div class="container" ref="container">
            <div class="container__header">
                <h1 ref="title">Pedido X</h1>
                <span class="push-both-sides"></span>
                <a @click="close()">[FECHAR]</a>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import anime from 'animejs';
    /*import CompanyFormComponent from "../../components/Forms/CompanyForm.vue";
    import UserFormComponent from "../../components/Forms/UserForm.vue";
    import DeviceFormComponent from "../../components/Forms/DeviceForm.vue";
    import OnMapLoadFormComponent from "../../components/Forms/OnMapLoadForm.vue";
    import GeofenceFormComponent from "../../components/Forms/GeofenceForm.vue";*/

    export default {
        components: {
            /*"app-company-form": CompanyFormComponent,
            "app-user-form": UserFormComponent,
            "app-device-form": DeviceFormComponent,
            "app-on-map-load-form": OnMapLoadFormComponent,
            "app-geofence-form": GeofenceFormComponent*/
        },
        data(){
            return {
                companyModal: { company: null },
                userModal: { user: null },
                deviceModal: { device: null },
                onMapLoadModal: { defaultSettings: null },
                geofenceModal: { geofence: null }
            }
        },
        watch: {
            isShowing(isShowing){
                const vm = this;
                if(isShowing){  // showing Morph Screen
                    const sourceElementPosition = vm.getElPositionInScreen(vm.sourceEl);
                    setImmediate(() => {
                        vm.$refs.morphScreen.style.width = vm.sourceEl.clientWidth + 'px';
                        vm.$refs.morphScreen.style.height = vm.sourceEl.clientHeight + 'px';
                        vm.$refs.morphScreen.style.top = sourceElementPosition.y + 'px';
                        vm.$refs.morphScreen.style.left = sourceElementPosition.x + 'px';
                        vm.$refs.morphScreen.style.borderRadius = vm.mimicBorderRadius + 'px';
                        vm.$refs.morphScreen.style.backgroundColor = vm.sourceElBgColor;
                        const animation = anime.timeline();
                        animation.add({
                            targets: vm.$refs.morphScreen,
                            top: '0px',
                            left: '0px',
                            width: window.innerWidth,
                            height: window.innerHeight,
                            borderRadius: 0,
                            duration: 200,
                            offset: 0,
                            easing: 'easeInQuint',
                            complete: function(anim){
                                vm.$refs.morphScreen.style.width = '100%';
                                vm.$refs.morphScreen.style.height = '100%';
                            }
                        }).add({
                                targets: vm.$refs.morphScreen,
                                easing: 'easeInQuad',
                                duration: 500,
                                offset: 0,
                                backgroundColor: '#212328',
                                opacity: {
                                    value: [.9, 1]
                                }
                            })
                        .add({
                            targets: vm.$refs.container,
                            easing: 'easeOutExpo',
                            opacity: [0, 1],
                            scale: [.9, 1],
                            duration: 200,
                            offset: 200
                        });
                    });
                }
            }
        },
        computed: {
            ...mapState('morph-screen', ['sourceEl','isShowing','sourceElBgColor','mimicBorderRadius']),
            ...mapState('auth', [
                'user', 'token', 'company'
            ])
        },
        methods: {
            ...mapMutations('morph-screen', ['showMorphScreen']),
            close(){
                const vm = this;
                anime({
                    targets: vm.$refs.morphScreen,
                    duration: 300,
                    elasticity: 0,
                    opacity: {
                        value: 0
                    },
                    complete: function(){
                        vm.showMorphScreen(false);
                    }
                });
            },
            beforeOpenCompanyForm(event){
                if(_.has(event.params, 'company')) this.companyModal.company = event.params.company;
            },
            beforeOpenUserForm(event){
                if(_.has(event.params, 'user')) this.userModal.user = event.params.user;
            },
            beforeOpenDeviceForm(event){
                if(_.has(event.params, 'device')) this.deviceModal.device = event.params.device;
            },
            beforeOpenOnMapLoadForm(event){
                if(_.has(event.params, 'defaultSettings')) this.deviceModal.defaultSettings = event.params.defaultSettings;
            },
            beforeOpenGeofenceForm(event){
                if(_.has(event.params, 'geofence')) this.deviceModal.geofence = event.params.geofence;
            },
            getElPositionInScreen(el){
                let xPos = 0;
                let yPos = 0;

                while (el) {
                    if (el.tagName == "BODY") {
                        // deal with browser quirks with body/window/document and page scroll
                        let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
                        let yScroll = el.scrollTop || document.documentElement.scrollTop;

                        xPos += (el.offsetLeft - xScroll + el.clientLeft);
                        yPos += (el.offsetTop - yScroll + el.clientTop);
                    } else {
                        // for all other non-BODY elements
                        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
                        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
                    }

                    el = el.offsetParent;
                }
                return {
                    x: xPos,
                    y: yPos
                };
            }
        },
        beforeDestroy(){
            this.close();
        }
    }
</script>

<style>
    div.app-morph-screen {
        top: 0px;
        left: 0px;
        position: absolute;
        z-index: 999999;
    }
    .container {
        width: 1200px;
        padding-top: 50px;
        margin: 0 auto;
        opacity: 0;
    }

    .container .container__header {
        display: flex;
        flex-direction: row;
    }
</style>
