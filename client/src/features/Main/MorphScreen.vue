<template>
    <div>

    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import CompanyFormComponent from "../../components/Forms/CompanyForm.vue";
    import UserFormComponent from "../../components/Forms/UserForm.vue";
    import DeviceFormComponent from "../../components/Forms/DeviceForm.vue";
    import OnMapLoadFormComponent from "../../components/Forms/OnMapLoadForm.vue";
    import GeofenceFormComponent from "../../components/Forms/GeofenceForm.vue";

    export default {
        components: {
            "app-company-form": CompanyFormComponent,
            "app-user-form": UserFormComponent,
            "app-device-form": DeviceFormComponent,
            "app-on-map-load-form": OnMapLoadFormComponent,
            "app-geofence-form": GeofenceFormComponent
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
        computed: {
            ...mapState('auth', [
                'user', 'token', 'company'
            ]),
            ...mapState('map', [
                'devices'
            ])
        },
        methods: {
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
        }
    }
</script>

<style>
</style>
