module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Card';

        const schema = new Schema({
            cardId: Number, 
            companyId: Number,
            createdBy: Number,
            requestId: Number,
            position: Number,
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