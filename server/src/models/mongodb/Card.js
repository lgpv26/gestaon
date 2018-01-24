const shortid = require('shortid')

module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Card';

        const schema = new Schema({
            code: String,
            name: {
                type: String,
                default: null
            },
            companyId: Number,
            createdBy: Number,
            requestId: Number,
            sectionId: String,
            position: {
                type: Number,
                default: 65535
            },
        }, {
            timestamps: {
                createdAt: 'createdAt',
                updatedAt: 'updatedAt'
            }
        });

        schema.pre('save', function(next) {
            if (this.isNew) {
                const cardCode = shortid.generate();
                this.set({
                    code: cardCode,
                    name: 'Card #' + cardCode
                })
            }
            next();
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