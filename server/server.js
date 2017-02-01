'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
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
    ],
    sessions: {}
};

const validate = function (decoded, request, callback) {

    // Check if the session is still valid
    const session = store.sessions[decoded.id];
    if (session && session.valid) {
        return callback(null, true);
    }
    else {
        return callback(null, false);
    }
};

const server = new Hapi.Server();
server.connection({ 
    port: 3000,
    routes: { cors: { additionalExposedHeaders: ['Authorization'] } }
});

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
                // Check username/password 
                const credentials = request.payload;
                const user = store.users[credentials.username];

                if (!user || credentials.password !== user.password) {
                    console.log('Bad user');
                    return reply(Boom.badRequest('Bad credentials'));
                }

                // Create a new session object
                const session = {
                    valid: true,
                    id: aguid(),
                    exp: Date.now() + 30 * 60 * 1000 // expired in 30 minutes
                };

                // Save the session object in the store
                store.sessions[session.id] = session;

                // Generate the Json Web Token with the new session as payload
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