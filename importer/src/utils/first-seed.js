module.exports = (server) => {
    return server.mysql.Company.create({
        name: 'Empresa ERP'
    }).then((company) => {
        return server.mysql.User.create({
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
                model: server.mysql.CompanyUser,
                as: 'userCompanies'
            }]
        }).then(() => {
            return server.mysql.User.create({
                name: 'Mailon Ruan',
                email: 'maailon@msn.com',
                type: 'admin',
                userCompanies: [
                    {
                        companyId: company.id,
                        isCreator: false
                    }
                ],
                password: '140992'
            }, {
                include: [{
                    model: server.mysql.CompanyUser,
                    as: 'userCompanies'
                }]
            }).then(() => {
                return server.mysql.User.create({
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
                        model: server.mysql.CompanyUser,
                        as: 'userCompanies'
                    }]
                })
            })
        })
    });
};
