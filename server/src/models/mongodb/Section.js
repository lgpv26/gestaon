const _ = require('lodash')
const shortid = require('shortid')

module.exports = {
    defineModel: (mongoose) => {

        const Schema = mongoose.Schema;
        const modelName = 'Section';

        const schema = new Schema({
            _id: String,
            companyId: Number,
            createdBy: Number,
            name: {
                type: String,
                default: null
            },
            cards: {
                type: Array,
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
                const sectionId = shortid.generate();
                this.set({
                    _id: sectionId,
                    name: 'Seção #' + sectionId
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
    postSettings: (mongoose, tModel, models) => {
        const Card = _.find(models, { name: 'Card' }).schema
        tModel.schema.set('cards', {
            type: [Card],
            default: []
        })
        return {
            instance: mongoose.model(tModel.name, tModel.schema),
            name: tModel.name
        }
    }
}