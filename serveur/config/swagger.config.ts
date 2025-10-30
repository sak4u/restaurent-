import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerconfig = new DocumentBuilder()
    .setTitle("Gestion Restaurant API")
    .setDescription("API for managing the restaurant server functionalities")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
    