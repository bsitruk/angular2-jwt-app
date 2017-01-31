'use strict';

const Hapi = require('hapi');
const hapiAuthJWT = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken');
const aguid = require('aguid');

const secretKey = 'VictoriaSecret';

const store = {
    users: {
        john: { username: 'john', password: 'clearpassword', name: 'John Doe', id: '1' }   
    },
    products: [
        { name: 'Intel i7', price: 300, type: 'CPU', id: '1' }
    ]
};

const validate = function (decoded, request, callback) {
    // TODO: check if the session object (decoded) exists in the database
    return callback(null, true);
};

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(hapiAuthJWT, function (err) {

    if (err) {
        console.log(err);
    }

    server.auth.strategy('jwt', 'jwt',
        { key: secretKey,
          validateFunc: validate,
          verifyOptions: {
              ignoreExpiration: true, 
              algorithms: [ 'HS256' ]
          }
        });
    
    server.auth.default('jwt');

    server.route([
        {
            method: 'GET', path: '/', config: { auth: false },
            handler: function (request, reply) {
                reply({text: 'Token not required'});
            }
        },
        {
            method: [ 'GET', 'POST' ], path: '/auth', config: { auth: false },
            handler: function (request, reply) {
                // TODO: Check login/password 

                const session = {
                    valid: true,
                    id: aguid(),
                    exp: Date.now() + 30 * 60 * 1000 // expired in 30 minutes
                };

                // TODO: Store session in the database so that it can be validated when a Token is received

                const token = JWT.sign(session, secretKey);
                console.log(token);

                reply({text: 'Check Auth Header for your Token'})
                    .header("Authorization", token);
            }
        },
        {
            method: 'GET', path: '/products', config: { auth: 'jwt' },
            handler: function (request, reply) {
                reply({text: 'you used a token !', products: store.products})
                    .header('Authorization', request.headers.authorization);
            }
        }
        // TODO: Logout route
    ]); 
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});