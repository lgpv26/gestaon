<template>
    <div class="ag-time-picker">
        <div class="display">
            <span :class="{active: editingHours}" @click="editHours()">{{ displayHours }}</span> :
            <span :class="{active: editingMinutes}" @click="editMinutes()"> {{ displayMinutes }}</span>
        </div>
        <div id="circle" ref="circle" @mousedown="circleMouseDown($event)">
            <div id="circle-in"></div>
            <div id="picker" ref="picker">
                <div id="picker-circle" @mousedown="mouseDown($event)"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import Popper from 'popper.js';
    import moment from 'moment';
    import _ from 'lodash';
    export default {
        data(){
            return {
                editingHours: true,
                editingMinutes: false,
                circle: null,
                picker: null,
                pickerCircle: null,
                rect: null,
                displayHours: "00",
                displayMinutes: "00",
                momentDatetime: null
            }
        },
        props: ['value', 'popper'],
        watch: {
            value(){
                this.setHoursAndMinutes(this.value);
            },
            displayHours(){
                this.$emit("changed", this.momentDatetime.hours(this.displayHours).toDate());
                this.$emit("input", this.momentDatetime.hours(this.displayHours).toDate());
            },
            displayMinutes(){
                this.$emit("changed", this.momentDatetime.minutes(this.displayMinutes).toDate());
                this.$emit("input", this.momentDatetime.minutes(this.displayMinutes).toDate());
            }
        },
        methods: {
            transform(){
                let prefs = ['t', 'WebkitT', 'MozT', 'msT', 'OT'],
                    style = document.documentElement.style,
                    p;
                for(let i = 0, len = prefs.length; i < len; i++){
                    if( (p = prefs[i] + 'ransform') in  style ) return p
                }
            },
            rotate(x, y){
                let deltaX = x - (this.rect.left + this.rect.width / 2),
                    deltaY = y - (this.rect.top + this.rect.height / 2);
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                if(this.editingHours) this.calculateRotationHours(angle);
                else this.calculateRotationMinutes(angle);
                return angle;
            },
            setHoursRotation(hours){
                this.picker.style[this.transform()] = 'rotate(' + ((parseInt(hours) - 6) * 15) + 'deg)';
            },
            setMinutesRotation(minutes){
                this.picker.style[this.transform()] = 'rotate(' + ((parseInt(minutes) - 15) * 6) + 'deg)';
            },
            calculateRotationHours(angle){
                const eachHourAngle = 360 / 24;
                /*const eachHourAngle = (angle + 180) / 24;*/
                let currentPosition = Math.floor(angle / eachHourAngle) + 12;
                if(currentPosition === 24) currentPosition = 0;
                currentPosition -= 6;
                if(currentPosition < 0){
                    currentPosition = 17 + 7 - Math.abs(currentPosition);
                }
                this.displayHours = (currentPosition < 10 ? '0' : '') + currentPosition;
            },
            calculateRotationMinutes(angle){
                const eachHourAngle = 360 / 60;
                /*const eachHourAngle = (angle + 180) / 24;*/
                let currentPosition = Math.floor(angle / eachHourAngle) + 30;
                if(currentPosition === 60) currentPosition = 0;
                currentPosition -= 15;
                if(currentPosition < 0){
                    currentPosition = 44 + 16 - Math.abs(currentPosition);
                }
                this.displayMinutes = (currentPosition < 10 ? '0' : '') + currentPosition;
            },
            mouseUp(){
                document.body.style.cursor = null;
                document.removeEventListener('mouseup', this.mouseUp);
                document.removeEventListener('mousemove', this.mouseMoved);
            },
            mouseDown(event){
                event.preventDefault();
                document.body.style.cursor = 'move';
                this.mouseMoved(event);
                document.addEventListener('mousemove', this.mouseMoved);
                document.addEventListener('mouseup', this.mouseUp);
            },
            mouseMoved(event){
                this.picker.style[this.transform()] = 'rotate(' + this.rotate(event.pageX, event.pageY) + 'deg)';
            },
            circleMouseDown(event){
                if(event.target === this.circle) this.mouseDown(event);
            },
            loadPicker(){
                const vm = this;
                vm.circle = vm.$refs.circle;
                vm.picker = vm.$refs.picker;
                vm.pickerCircle = vm.picker.firstElementChild;
                vm.rect = vm.circle.getBoundingClientRect();
            },
            popperUpdated(){
                this.rect = this.circle.getBoundingClientRect();
            },
            editHours(){
                this.editingHours = true;
                this.editingMinutes = false;
                this.setHoursRotation(this.displayHours);
            },
            editMinutes(){
                this.editingHours = false;
                this.editingMinutes = true;
                this.setMinutesRotation(this.displayMinutes);
            },
            setHoursAndMinutes(datetime = false){
                if(datetime) this.momentDatetime = moment(datetime);
                else this.momentDatetime = moment();
                this.displayHours = this.momentDatetime.format("HH");
                this.displayMinutes = this.momentDatetime.format("mm");
                if(this.editingHours) this.setHoursRotation(this.displayHours);
                if(this.editingMinutes) this.setMinutesRotation(this.displayMinutes);
            }
        },
        mounted(){
            const vm = this;
            vm.loadPicker();
            vm.setHoursAndMinutes(new Date());
        }
    }
</script>

<style scoped>
    div.ag-time-picker {
        padding: 5px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    #circle{
        position: relative;
        width: 246px;
        height: 246px;
        border-radius: 50%;
        background: rgba(0,0,0,.1);
        border: 3px solid #61AFEF;
        margin-left: -3px;
    }

    #circle-in{
        position: absolute;
        top: 15px;
        left: 15px;
        width: 210px;
        height: 210px;
        border-radius: 50%;
        border: 3px solid rgba(0,0,0,.1);
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.ag-time-picker > div.display {
        position: absolute;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 32px;
        color: #AAA;
    }

    div.ag-time-picker > div.display span {
        font-size: 32px;
        color: #AAA;
        cursor: pointer;
    }

    div.ag-time-picker > div.display span.active {
        color: #FFF;
    }

    #picker{
        position: absolute;
        top: 50%;
        left: 50%;
        height: 30px;
        margin-top: -15px;
        width: 50%;

        -webkit-transform-origin: center left;
        -moz-transform-origin: center left;
        -ms-transform-origin: center left;
        -o-transform-origin: center left;
        transform-origin: center left;
    }

    #picker-circle {
        position: absolute;
        background: orange;
        width: 30px;
        height: 30px;
        box-shadow: 0 0 0 3px orange;
        border-radius: 60px;
        left: 100%;
        margin-left: -18px;
        border-bottom-left-radius: 0;
        content: "";
        transform: rotate(45deg);
        cursor: pointer;
    }
    /*#picker-circle{
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #fff;
        margin: 0 3px 0 auto;
        cursor: move;
    }*/
</style>
