const mongoose = require('mongoose');

module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Position';

        const schema = new Schema({
            deviceCode: String,
            isActive: Boolean,
            isAccOn: Boolean,
            broadcast: Boolean,
            latitude: String,
            longitude: String,
            address: String,
            speed: String,
            bearing: String,
            altitude: String,
            battery: String,
            generatedAt: Date
        }, {
            timestamps: {
                createdAt: 'createdAt',
                updatedAt: 'updatedAt'
            }
        });

        schema.set('toJSON', {
             transform: function (doc, ret, options) {
                 ret.id = ret._id;
                 delete ret._id;
                 delete ret.__v;
             }
        });

        return {
            schema: schema,
            name: modelName
        }

    },
    postSettings: (mongoose, tModel) => {
        return {
            instance: mongoose.model(tModel.name, tModel.schema),
            name: tModel.name
        }
    }
}

/*
{ id: '794689',
    timestamp: '1484746571',
    lat: '-23.4134387496345',
    lon: '-51.90371158955689',
    speed: '1.56946344606328',
    bearing: '53.36874008178711',
    altitude: '570.6479121218471',
    batt: '35.0' }
*/
