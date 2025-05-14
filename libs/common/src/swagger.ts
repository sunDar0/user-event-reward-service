import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export default async function (
  app: INestApplication,
  configService: ConfigService
) {
  const config = new DocumentBuilder()
    .setTitle(
      `${configService.get("APP_NAME")}_${configService.get("APP_ENV")}`
    )
    .setDescription(`${configService.get("APP_NAME")} API 문서입니다.`)
    .setVersion(configService.get<string>("APP_VERSION"))
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "jwt",
        in: "header",
      },
      "jwt"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // 스웨거 라우트 연동
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  });
}
