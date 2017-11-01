const GeoJSON = require('mongoose-geojson-schema');

module.exports = {
    defineModel: (mongoose) => {
        const Schema = mongoose.Schema;
        const modelName = 'Geofence';
        const schema = new Schema({
            companyId: Number,
            name: {
                type: String,
                uppercase: true,
                trim: true,
                required: [true, 'Um nome deve ser atribuido a cerca virtual.'],
                minlength: [2, "O nome deve possuir no mínimo 2 dígitos."],
                maxlength: [24, "O nome deve possuir no máximo 24 dígitos."]
            },
            devices: [{ type: Schema.Types.ObjectId, ref: 'Device' }],
            interval: Number,
            alarmOnLeave: Boolean,
            alarmOnEnter: Boolean,
            repeat: Number,
            color: String,
            polygon: mongoose.Schema.Types.Polygon
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
