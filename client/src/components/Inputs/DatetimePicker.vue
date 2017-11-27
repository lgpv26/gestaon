<template>
    <div class="ag-datetime-picker">
        <div class="input-area" @click="openPopper" ref="popperReference">
            <slot></slot>
        </div>
        <div class="picker__container" :class="{active: active}" ref="popperContainer">
            <div class="calendar" v-show="step === 'date'">
                <div class="month">
                    <a class="prev-month" @click="navigateToPrevMonth()"><</a>
                    <h3>{{ calendar.month.text }}</h3>
                    <a class="next-month" @click="navigateToNextMonth()">></a>
                </div>
                <div class="weekdays">
                    <ul>
                        <li v-for="weekDay in calendar.week.days">{{ weekDay.abb }}</li>
                    </ul>
                </div>
                <div class="days">
                    <ul v-for="rowDays in calendar.days">
                        <li v-for="rowDay in rowDays" :class="{ 'current-month': rowDay.currentMonth, 'active': rowDay.active }" @click="selectDay(rowDay)">{{ rowDay.text }}</li>
                    </ul>
                </div>
            </div>
            <div class="time" v-show="step === 'time'">
                <app-time-picker ref="timePicker" :popper="popper.instance" @changed="$emit('input',$event)" v-model="datetime"></app-time-picker>
            </div>
        </div>
    </div>
</template>
<script>
    import Popper from 'popper.js';
    import moment from 'moment';
    import _ from 'lodash';
    import TimePickerComponent from './TimePicker.vue';

    export default {
        components: {
            'app-time-picker': TimePickerComponent
        },
        data(){
            return {
                step: 'date',
                popper: {
                    instance: null,
                    referenceEl: null,
                    containerEl: null
                },
                calendar: {
                    month: {
                        text: null
                    },
                    week: {
                        days: []
                    },
                    days: [],
                    daysInMonth: 0,
                    firstDayInMonth: 0
                },
                active: false,
                displayDatetime: null,
                momentDatetime: null,
                datetime: null
            }
        },
        props: ['value', 'offset'],
        watch: {
            value(){
                this.setDateAndTime(this.value);
                this.popper.instance.update();
            }
        },
        methods: {
            getWeekDays(){
                const weekDays = moment.weekdays();
                weekDays.push(weekDays.shift());
                return _.map(weekDays, (weekDay) => {
                    return {
                        abb: weekDay.charAt(0),
                        text: weekDay
                    }
                });
            },
            getFirstWeekdayOfMonth(){
                const momentDatetime = _.cloneDeep(this.momentDatetime);
                const first = momentDatetime.startOf('month');
                return first.day() % 6 === 0 ? first.add(1, 'day').day(1) : first;
            },
            fillCalendar(){
                const vm = this;
                const momentDatetime = _.cloneDeep(this.momentDatetime);
                this.calendar.month.text = momentDatetime.format('MMMM');
                this.calendar.week.days = this.getWeekDays();
                this.calendar.daysInMonth = momentDatetime.daysInMonth();
                let offset = 0;
                for(let i = 1; i <= this.calendar.daysInMonth; i++){
                    if(i === 1) {
                        vm.calendar.week.days.forEach((weekDay, index) => {
                            if (weekDay.text === vm.getFirstWeekdayOfMonth().format('dddd')) {
                                offset = index + 1;
                            }
                        });
                    }
                    let row = Math.ceil((i + offset) / 7) - 1;
                    if(typeof vm.calendar.days[row] === 'undefined'){
                        vm.calendar.days[row] = [];
                    }
                    let iDay = {
                        currentMonth: true,
                        text: (i < 10 ? '0' : '') + i
                    };
                    iDay.active = momentDatetime.format('DD') === iDay.text;
                    vm.calendar.days[row].push(iDay);
                }
                /* fill missing days in first week */
                let missingDaysInFirstWeek = (7 - vm.calendar.days[0].length) - 1;
                let prevMonth = momentDatetime.subtract(1,'months');
                let iDay = {
                    currentMonth: false,
                    active: false,
                    text: prevMonth.endOf('month').format('DD')
                };
                vm.calendar.days[0].unshift(iDay);
                for(let i = 1; i <= missingDaysInFirstWeek; i++){
                    let iDay = {
                        currentMonth: false,
                        active: false,
                        text: prevMonth.endOf('month').subtract(i,'days').format('DD')
                    };
                    vm.calendar.days[0].unshift(iDay);
                }
                /* fill missing days in last week */
                const lastWeekDaysLength = vm.calendar.days[vm.calendar.days.length-1].length;
                let missingDaysInLastWeek = (7 - lastWeekDaysLength) - 1;
                let nextMonth = momentDatetime.add(1,'months');
                if(lastWeekDaysLength < 7){
                    let iDay = { currentMonth: false, active: false, text: nextMonth.startOf('month').format('DD') };
                    vm.calendar.days[vm.calendar.days.length-1].push(iDay);
                    for(let i = 1; i <= missingDaysInLastWeek; i++){
                        let iDay = {
                            currentMonth: false,
                            active: false,
                            text: nextMonth.startOf('month').add(i,'days').format('DD')
                        };
                        vm.calendar.days[vm.calendar.days.length-1].push(iDay);
                    }
                }

            },
            setDateAndTime(datetime = false){
                const vm = this;
                vm.reset();
                if(moment.isDate(datetime)) {
                    this.momentDatetime = moment(datetime)
                }
                else if(moment.isMoment(datetime)){
                    this.momentDatetime = datetime;
                }
                else {
                    this.momentDatetime = moment();
                }
                this.displayDatetime = this.momentDatetime.format("DD/MM/YYYY HH:mm:ss");
                this.datetime = this.momentDatetime.toDate();
                this.fillCalendar();
            },
            selectDay(day){
                if(!day.currentMonth) return false;
                this.$emit('input', this.momentDatetime.date(parseInt(day.text)).toDate());
                this.step = 'time';
            },
            navigateToPrevMonth(){
                const momentDatetime = _.cloneDeep(this.momentDatetime);
                this.$emit('input', momentDatetime.subtract(1,'month').toDate());
            },
            navigateToNextMonth(){
                const momentDatetime = _.cloneDeep(this.momentDatetime);
                this.$emit('input', momentDatetime.add(1,'month').toDate());
            },
            reset(){
                Object.assign(this.$data.calendar, this.$options.data().calendar);
            },
            openPopper(){
                this.active = true;
                if(this.active && this.popper.instance){
                    this.step = 'date';
                    this.popper.instance.update();
                }
            },
            clickEvent(e){
                const vm = this;
                if(vm.$refs.popperReference.contains(e.target) || vm.$refs.popperReference === e.target){}
                else if(!vm.$refs.popperContainer.contains(e.target) && vm.$refs.popperReference !== e.target){
                    vm.active = false;
                }
            }
        },
        created(){
            this.setDateAndTime();
        },
        mounted(){
            const vm = this;
            this.popper.referenceEl = this.$refs['popperReference']; this.popper.containerEl = this.$refs['popperContainer'];
            this.popper.instance = new Popper(this.popper.referenceEl, this.popper.containerEl, {
                placement: 'bottom-start',
                onUpdate(){
                    if(_.hasIn(vm.$refs, 'timePicker') && _.hasIn(vm.$refs.timePicker, 'popperUpdated')){
                        vm.$refs.timePicker.popperUpdated();
                    }
                },
                modifiers: {
                    hide: {
                        enabled: true
                    },
                    applyStyle: {
                        enabled: true
                    }
                }
            });
            if(typeof this.offset !== 'undefined') {
                if (_.has(this.offset, 'bottom')) {
                    this.popper.containerEl.style.marginTop = this.offset.bottom + 'px';
                }
                if (_.has(this.offset, 'top')) {
                    this.popper.containerEl.style.marginBottom = this.offset.top + 'px';
                }
            }
            window.addEventListener('click', this.clickEvent);
        },
        destroyed(){
            window.removeEventListener('click', this.clickEvent);
        }
    }
</script>

<style scoped>
    .ag-datetime-picker {
        position: relative;
    }
    .picker__container {
        z-index: 99999;
        width: 280px;
        background: var(--bg-color---5);
        -webkit-box-shadow: var(--popover-shadow);
        box-shadow: var(--popover-shadow);
        padding: 15px;
        transition: .2s opacity;
        visibility: hidden;
        display: flex;
        opacity: 0;
    }
    .picker__container.active {
        visibility: visible;
        transition: .2s opacity;
        opacity: 1;
    }
    div.calendar {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    div.calendar .month {
        display: flex;
        flex-direction: row;
        margin-bottom: 15px;
        flex-grow: 1;
    }
    div.calendar .month > h3 {
        flex-grow: 1;
        text-align: center;
        font-size: 20px;
        text-transform: uppercase;
    }
    div.calendar .month a.prev-month, div.calendar .month a.next-month {
        width: 24px;
        height: 24px;
        border-radius: 100%;
        background-color: rgba(0,0,0,.5);
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        position: relative;
        top: 3px;
    }
    div.calendar .weekdays ul {
        display: flex;
        flex-direction: row;
    }
    div.calendar .weekdays ul li {
        flex-grow: 1;
        text-align: center;
        padding: 5px;
        font-weight: bold;
    }
    div.calendar .days {
        display: flex;
        flex-direction: column;
    }
    div.calendar .days ul {
        display: flex;
        flex-direction: row;
    }
    div.calendar .days ul li {
        flex-grow: 1;
        flex-basis: 0;
        text-align: center;
        padding: 5px;
        color: #666;
        cursor: pointer;
    }
    div.calendar .days ul li.current-month {
        color: #AAA;
        transition: all .2s;
    }
    div.calendar .days ul li.current-month:hover {
        background: rgba(0,0,0,.5)
    }
    div.calendar .days ul li.current-month.active {
        background: rgba(0,0,0,.5);
        color: #FFF;
    }
</style>
