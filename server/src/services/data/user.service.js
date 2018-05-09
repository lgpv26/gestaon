import _ from 'lodash'
import {Op} from 'sequelize'

module.exports = (server) => { return {
    name: "data/user",
    actions: {
        getOne(ctx) {

        },
        getList(ctx){
            return server.mysql.CompanyUser.findAll({
                include: [
                    {
                        model: server.mysql.User,
                        as: 'user'
                    }
                ],
                where: {
                    companyId: {
                        [Op.in]: [ctx.params.data.companyId]
                    }
                }
            }).then((data) => {
                return JSON.parse(JSON.stringify(data))
            }).then((data) => {
                return _.map(data, (companyUser) => {
                    return companyUser.user
                })
            })
        },
        create(ctx){

        },
        update(ctx){

        },
        remove(ctx){

        }
    }
}}