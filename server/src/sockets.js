var fs = require('fs')

module.exports = function (server) {

    /**
     * Draft socket settings
     */

    let socketFiles = [
        "Request"
    ];

    let drafts = [];

    socketFiles.forEach(function (fileName) {
        // Ignore this file and invalid ones
        if (fileName === 'index.js' || fileName.substr(0, 1) === '.' || fileName.substr(0, 1) === '_') {
            return;
        }
        // Require all drafts business logics
        drafts.push(require('./events/Draft/' + fileName));
    });
    
    let channels = { 
        updates: {
            drafts: []
        }
    }

    /* End of draft socket settings */

    server.io.on('connection', (socket) => {
        let token = socket.handshake.query.token, user;
        server.mysql.UserAccessToken.findOne({
            where: {
                accessToken: token
            },
            include: [
                {
                    model: server.mysql.User,
                    as: 'user',
                    include: [
                        {
                            model: server.mysql.Company,
                            as: 'companies'
                        }
                    ]
                }
            ]
        }).then((userAccessToken) => {
            if (userAccessToken && typeof userAccessToken.user !== 'undefined') {

                /* Initial setting when user connects, or reconnects */

                user = userAccessToken.user;
                socket.user = {id: user.id, name: user.name, email: user.email, activeCompanyUserId: user.activeCompanyUserId, companies: []}
                user.companies.forEach((company) => {
                    socket.user.companies.push(company.id)
                    server.mongodb.Device.find({
                        companyId: company.id
                    }).exec().then((devices) => {
                        devices.forEach((device) => {
                            // console.log(user.name + " connected to room: " + 'device/' + device.code);
                            socket.join('device/' + device.code);
                        });
                    }).catch((err) => {
                        console.log(err);
                    });
                });

                /* Importing draft events */

                drafts.forEach((s) => {
                    new s(server, channels, socket);
                });

                /* Importing request board events */

                const RequestBoard = require('./events/RequestBoard')
                new RequestBoard(server, socket)

            }
        });

        socket.on('join-device-room', (deviceCode) => {
            // console.log(user.name + " joins device/" + deviceCode + ".");
            socket.join('device/' + deviceCode);
        });
        socket.on('leave-device-room', (deviceCode) => {
            // console.log(user.name + " leaves device/" + deviceCode + ".");
            socket.leave('device/' + deviceCode);
        });
    });
};

