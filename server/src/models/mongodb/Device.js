module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Device';

        const schema = new Schema({
            code: {
                type: String,
                unique: true,
                uppercase: true,
                trim: true,
                index: true,
                required: [true, 'Um código deve ser atribuido ao dispositivo.'],
                minlength: [5, "O código deve ser no mínimo 5 dígitos."],
                maxlength: [20, "O código deve possuir no máximo 20 dígitos."]
            },
            name: {
                type: String,
                uppercase: true,
                trim: true,
                required: [true, 'Um nome deve ser atribuido ao dispositivo.'],
                minlength: [5, "O nome deve possuir no mínimo 5 dígitos."],
                maxlength: [20, "O nome deve possuir no máximo 20 dígitos."]
            },
            protocol: {
                type: String,
                default: 'osmand',
                trim: true,
                required: [true, 'Um protocolo deve ser fornecido.'],
                enum: {
                    values: ['osmand','gps103','agiliza','tlt2h'],
                    message: 'Protocolo inválido.'
                }
            },
            settings: {
                type: Object,
                default: {}
            },
            color: {
                type: String,
                validate: {
                    validator: function(v) {
                        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(v);
                    },
                    message: 'A cor deve ser um hexadecimal prefixado com uma \"#\" (cerquilha).'
                },
                default: '#AA0000'
            },
            isPortable: Boolean,
            phoneNumber: String,
            companyId: Number,
            sharedCompanies: [Number],
            obs: String
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