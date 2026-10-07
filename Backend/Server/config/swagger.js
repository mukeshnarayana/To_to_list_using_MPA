const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load Swagger document from YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = { setupSwagger, swaggerDocument };
