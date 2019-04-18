<template>
    <div scrollbar style="width: 100%">
        <div class="scrollable-content">
            <div class="on-map-load-form">
                <app-panel-loading :loading="loading" :loadingText="'Carregando...'"></app-panel-loading>
                <div class="modal-container">
                    <div class="columns">
                        <div class="column">
                            <h3 class="form-title">MAPA AO ENTRAR</h3>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <div id="on-map-load-map">
                            </div>
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <a class="button is-primary" @click="saveMapPreferences()" style="float: right">
                                Ok!
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import companiesAPI from '../../api/companies';
    import Scrollbar from 'smooth-scrollbar';
    import PanelLoadingComponent from '../Utilities/PanelLoading.vue';
    import _ from 'lodash';
    export default {
        props: {
            value: {
                default: null
            },
            defaultSettings: {
                default: null
            }
        },
        components: {
            'app-panel-loading': PanelLoadingComponent
        },
        data(){
            return {
                scrollbars: null,
                loading: false,
                map: null,
                form: {
                    id: null,
                    name: null
                }
            }
        },
        computed: {
            ...mapState('auth', {
                user: 'user',
                company: 'company'
            })
        },
        methods: {
            ...mapActions('toast', ['showToast']),
            ...mapActions('auth', ['saveCompanySettings']),
            saveMapPreferences(){
                const vm = this;
                vm.loading = true;
                const mapZoom = vm.map.getZoom();
                const mapCenter = vm.map.getCenter();
                vm.saveCompanySettings({
                    onMapLoadZoom: mapZoom,
                    onMapLoadLatitude: mapCenter.lat(),
                    onMapLoadLongitude: mapCenter.lng()
                }).then(({data}) => {
                    vm.$modal.hide('on-map-load-form');
                    vm.showToast({
                        type: "success",
                        message: "Preferências salvadas com sucesso."
                    });
                }).catch((err) => {
                    this.showToast({
                        type: "error",
                        message: "Erro ao salvar as preferências."
                    });
                });
            }
        },
        created(){
            const vm = this;
            /*if(vm.company){
                _.assign(vm.form, _.pick(vm.company, _.keys(vm.form)));
            }*/
        },
        mounted(){
            // initialize scrollbars
            this.scrollbars = Scrollbar.initAll({
                overscrollEffect: 'bounce'
            });
            this.map = new google.maps.Map(document.getElementById('on-map-load-map'), {
                center: {lat: -13.741571410068916, lng: -50.891859152836616},
                zoom: 4,
                disableDefaultUI: true
            });
        }
    }
</script>

<style scoped>
    h3.form-title {
        color: #999;
    }
    div.on-map-load-form {
        position: relative;
        flex-grow: 1;
    }
    div.on-map-load-form:last-child {
        margin-bottom: 0;
    }
    div.on-map-load-form-subsection {
        border: 1px solid rgba(150,150,150,0.1);
        padding: 20px;
    }
    div.on-map-load-form-subsection h3 {
        margin-bottom: 10px;
    }

    #on-map-load-map {
        width: 100%;
        height: 300px;
    }

    #on-map-load-map:after {
        width: 22px;
        height: 40px;
        display: block;
        content: ' ';
        position: absolute;
        top: 50%; left: 50%;
        margin: -40px 0 0 -11px;
        background: url('https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi_hdpi.png');
        background-size: 22px 40px; /* Since I used the HiDPI marker version this compensates for the 2x size */
        pointer-events: none; /* This disables clicks on the marker. Not fully supported by all major browsers, though */
    }

</style>
