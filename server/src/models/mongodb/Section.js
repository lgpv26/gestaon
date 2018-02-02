const _ = require('lodash')
const shortid = require('shortid')

module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Section';

        const schema = new Schema({
            code: String,
            companyId: Number,
            createdBy: Number,
            name: {
                type: String,
                default: null
            },
            cards: {
                type: [{
                    type: mongoose.Schema.ObjectId,
                    ref: 'Card'
                }],
                default: []
            },
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
                const sectionCode = shortid.generate();
                this.set({
                    code: sectionCode,
                    name: 'Seção #' + sectionCode
                })
            }
            next();
        });

        schema.set('toJSON', {
             transform: function (doc, ret, options) {
                 ret.id = ret._id
                 delete ret._id
                 delete ret.__v
             }
        });

        return {
            schema: schema,
            name: modelName
        }

    },
    postSettings: (mongoose, tModel, models) => {
        return {
            instance: mongoose.model(tModel.name, tModel.schema),
            name: tModel.name
        }
    }
}