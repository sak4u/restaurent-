"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerconfig = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.swaggerconfig = new swagger_1.DocumentBuilder()
    .setTitle("Gestion Restaurant API")
    .setDescription("API for managing the restaurant server functionalities")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
//# sourceMappingURL=swagger.config.js.map