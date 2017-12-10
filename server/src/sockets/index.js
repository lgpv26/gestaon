var fs = require('fs')

module.exports = function (server) {
    /* import all sockets files */

    let socketFiles = [
        "request.js"
    ];

    let sockets = [];

    socketFiles.forEach(function (fileName) {
        // Ignore this file and invalid ones
        if (fileName === 'index.js' || fileName.substr(0, 1) === '.' || fileName.substr(0, 1) === '_') {
            return;
        }
        // Require all files inside this directory
        sockets.push(require('./' + fileName));
    })

    
    let channels = { 
            updates: {
                drafts: []
            }
        }
   
    // clients connected to real-time features
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
                sockets.forEach((s) => {
                    new s(server, channels, socket);
                });
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

