module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Draft';

        const schema = new Schema({
            draftId: Number, 
            companyId: Number,
            createdBy: Number,
            cardId: Number,
            type: {
                type: String,
                enum: {
                    values: ['request','expense','accounts'],
                    message: 'Tipo de raschunho inválido'
                }
            },
            isSingle: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object,
                default: {}
            }
        }, {
            timestamps: {
                createdAt: 'createdAt',
                updatedAt: 'updatedAt'
            },
            minimize: false
        })

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