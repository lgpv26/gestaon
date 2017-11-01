import _ from 'lodash';
import moment from 'moment';

export default {

    // Masks

    formatPhone(phoneNumber){
        phoneNumber = phoneNumber.trim();
        const ddd = phoneNumber.substring(0, 2);
        const number = phoneNumber.substring(3);
        console.log(number);
        if(number.length === 8){

            return '(' + ddd + ') ' + number.substring(0, 4) + '-' + number.substring(5, 8);
        }
        else if(number.length === 9){
            return '(' + ddd + ') ' + number.substring(0, 5) + '-' + number.substring(5, 10);
        }
        else{
            return false;
        }
    },

    formatDateAndTime(dateAndTime, format){
        return moment(dateAndTime).format(format);
    },

    /*
    * Get
    * */

    getDDDAndNumber(phoneNumber){
        phoneNumber.replace(/\D/g,'');
        const ddd = phoneNumber.substring(0,2);
        const number = phoneNumber.substring(2);
        return {
            ddd,
            number
        };
    },

    /*
    * Tracker utilities
    * */

    isDistanceViableThroughSpeed(speed, timeDifference, distance){
        if(distance < ((speed / 3.6) * timeDifference))
            return true;
        else
            return false;
    },

    getRandomDarkColor(){
        let letters = '012345'.split('');
        let color = '#';
        color += letters[Math.round(Math.random() * 5)];
        letters = '0123456789ABCDEF'.split('');
        for(let i = 0; i < 5; i++){
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    },

    // Get Direction by Rotation Degree

    getDirection(rotation){

        if(rotation >= 0 && rotation <= 11.25){
            return "Norte";
        }
        else if(rotation > 11.25 && rotation < 33.75){
            return "NNE";
        }
        else if(rotation > 33.75 && rotation < 56.25){
            return "Nordeste";
        }
        else if(rotation > 56.25 && rotation < 78.75){
            return "ENE";
        }
        else if(rotation > 78.75 && rotation < 101.25){
            return "Leste";
        }
        else if(rotation > 101.25 && rotation < 123.75){
            return "ESE";
        }
        else if(rotation > 123.75 && rotation < 146.25){
            return "Sudeste";
        }
        else if(rotation > 146.25 && rotation < 168.75){
            return "SSE";
        }
        else if(rotation > 168.75 && rotation < 191.25){
            return "Sul";
        }
        else if(rotation > 191.25 && rotation < 213.75){
            return "SSW";
        }
        else if(rotation > 213.75 && rotation < 236.25){
            return "Sudoeste";
        }
        else if(rotation > 236.25 && rotation < 258.75){
            return "WSW";
        }
        else if(rotation > 258.75 && rotation < 281.25){
            return "Oeste";
        }
        else if(rotation > 281.25 && rotation < 303.75){
            return "WNW";
        }
        else if(rotation > 303.75 && rotation < 326.25){
            return "Noroeste";
        }
        else if(rotation > 326.25 && rotation < 348.75){
            return "NNW";
        }
        else if(rotation > 348.75 && rotation < 360){
            return "Norte";
        }

    }

}
