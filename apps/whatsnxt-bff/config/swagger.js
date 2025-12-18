const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

function setupSwagger(app) {
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Whatsnxt Blog API',
                description: 'Whatsnxt Blog REST API Documentation',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 3333}/api`,
                    description: 'Development server'
                },
                {
                    url: 'https://api.whatsnxt.in/api',
                    description: 'Production server'
                }
            ],
        },
        apis: [
            './app/blog/routes/*.js',
            './app/course/routes/*.js',
            './app/common/routes/*.js'
        ],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Whatsnxt API Documentation'
    }));

    app.get('/swagger/json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

module.exports = { setupSwagger };