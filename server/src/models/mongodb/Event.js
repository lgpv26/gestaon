module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Event';

        const schema = new Schema({
            companyId: Number,
            deviceCode: String,
            type: {
                type: String,
                enum: {
                    values: ['command','alarm'],
                    message: 'Tipo de evento não reconhecido.'
                }
            },
            alarms: [
                {
                    publishedAt: Date
                }
            ],
            alarmGeofence: {
                type: Schema.Types.ObjectId,
                ref: 'Geofence'
            },
            alarmType: {
                type: String,
                enum: {
                    values: ['geofence_enter', 'geofence_leave'],
                    message: 'Tipo de evento não reconhecido.'
                }
            },
            smsId: String,
            smsReplies: [String],
            data: String
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