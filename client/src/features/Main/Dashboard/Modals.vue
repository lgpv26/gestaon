<template>
    <div>
        <modal name="request-chat" :resizable="true" :width="860" :height="520" :minWidth="860" :minHeight="520" classes="app-modal" @before-open="beforeOpenRequestChat">
            <app-request-chat :requestChat="requestChatModal.requestChat"></app-request-chat>
        </modal>
        <modal name="user-form" :resizable="true" :width="600" :height="320" :minWidth="600" :minHeight="320" classes="app-modal" @before-open="beforeOpenUserForm">
            <app-user-form :user="userModal.user"></app-user-form>
        </modal>
        <modal name="company-form" :resizable="true" :width="600" :height="320" :minWidth="600" :minHeight="320" classes="app-modal" @before-open="beforeOpenCompanyForm">
            <app-company-form :company="companyModal.company"></app-company-form>
        </modal>
        <modal name="device-form" :resizable="true" :width="600" :height="320" :minWidth="600" :minHeight="320" classes="app-modal" @before-open="beforeOpenDeviceForm">
            <app-device-form :device="deviceModal.device"></app-device-form>
        </modal>
        <modal name="on-map-load-form" :resizable="true" :width="600" :height="450" :minWidth="600" :minHeight="320" classes="app-modal" @before-open="beforeOpenOnMapLoadForm">
            <app-on-map-load-form :defaultSettings="onMapLoadModal.defaultSettings"></app-on-map-load-form>
        </modal>
        <modal name="geofence-form" :resizable="true" :width="600" :height="450" :minWidth="600" :minHeight="320" classes="app-modal" @before-open="beforeOpenGeofenceForm">
            <app-geofence-form :defaultSettings="geofenceModal.geofence"></app-geofence-form>
        </modal>
    </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import CompanyFormComponent from "../../../components/Forms/CompanyForm.vue";
    import UserFormComponent from "../../../components/Forms/UserForm.vue";
    import DeviceFormComponent from "../../../components/Forms/DeviceForm.vue";
    import OnMapLoadFormComponent from "../../../components/Forms/OnMapLoadForm.vue";
    import GeofenceFormComponent from "../../../components/Forms/GeofenceForm.vue";
    import RequestChatComponent from "../_Shared/RequestChat/RequestChat.vue";

    export default {
        components: {
            "app-company-form": CompanyFormComponent,
            "app-user-form": UserFormComponent,
            "app-device-form": DeviceFormComponent,
            "app-on-map-load-form": OnMapLoadFormComponent,
            "app-geofence-form": GeofenceFormComponent,
            "app-request-chat": RequestChatComponent
        },
        data(){
            return {
                companyModal: { company: null },
                userModal: { user: null },
                deviceModal: { device: null },
                onMapLoadModal: { defaultSettings: null },
                geofenceModal: { geofence: null },
                requestChatModal: { requestChat: null }
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
            beforeOpenRequestChat(event){
                if(_.has(event.params, 'requestChat')) this.requestChatModal = event.params.requestChat;
            },
        }
    }
</script>

<style>
</style>
