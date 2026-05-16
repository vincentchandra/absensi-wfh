import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the React frontend (running on port 5173) can call this API
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe — similar to adding @Valid on all controllers
  // Automatically validates incoming payloads against DTO rules
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip out properties that don't have decorators
      transform: true, // automatically transform payloads to DTO object instances
    }),
  );

  // Set global prefix to /api
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log(`Application is running on: await app.getUrl()`);
}
bootstrap();
