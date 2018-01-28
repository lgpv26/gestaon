module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Draft';

        const schema = new Schema({
            draftId: Number, 
            companyId: Number,
            createdBy: Number,
            recoverancedBy: {
                type: Number,
                default: null
            },
            type: {
                type: String,
                enum: {
                    values: ['request'],
                    message: 'Tipo de raschunho não reconhecido.'
                }
            },
            form: {
                type: Object,
                default: {}
            },
            presence: {
                type: Array,
                default: []
            },
            data: {
                type: Object,
                default: {}
            },
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