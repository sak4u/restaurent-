import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import { swaggerconfig } from "../config/swagger.config";
async function bootstrap() {
    const app = await NestFactory.create(AppModule,{cors: true});
    const port = process.env.PORT || 3000;
    const document = SwaggerModule.createDocument(app, swaggerconfig);
    SwaggerModule.setup("api", app, document);
    await app.listen(port);
  console.log(`🔧 Listening on port: ${port}`);
  console.log(`📖 Swagger documentation available at: http://localhost:${port}/api`);
 
}
bootstrap();