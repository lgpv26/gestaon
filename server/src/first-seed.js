module.exports = (server) => {
    return server.models.Company.create({
        name: 'Empresa ERP'
    }).then((company) => {
        return server.models.User.create({
            name: 'Thiago Rocha',
            email: 'thyoity@gmail.com',
            type: 'admin',
            userCompanies: [
                {
                    companyId: company.id,
                    isCreator: true
                }
            ],
            password: '123'
        }, {
            include: [{
                model: server.models.CompanyUser,
                as: 'userCompanies'
            }]
        }).then(() => {
            return server.models.User.create({
                name: 'Mailon Ruan',
                email: 'maailon@msn.com',
                type: 'admin',
                userCompanies: [
                    {
                        companyId: company.id,
                        isCreator: false
                    }
                ],
                password: '123'
            }, {
                include: [{
                    model: server.models.CompanyUser,
                    as: 'userCompanies'
                }]
            }).then(() => {
                return server.models.User.create({
                    name: 'Acimar Rocha',
                    email: 'acimarrocha@gmail.com',
                    type: 'admin',
                    userCompanies: [
                        {
                            companyId: company.id,
                            isCreator: false
                        }
                    ],
                    password: '123'
                }, {
                    include: [{
                        model: server.models.CompanyUser,
                        as: 'userCompanies'
                    }]
                })
            })
        })
    });
};
