module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Call';

        const schema = new Schema({
            companyId: Number,
            number: {
                type: String,
                required: [true, 'O número do telefone deve existir.'],
                minlength: [10, "O telefone deve ter no mínimo 10 dígitos."],
                maxlength: [11, "O telefone deve ter no máximo 11 dígitos."]
            }
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