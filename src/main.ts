import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(['*']);
  // app.setGlobalPrefix('api');
  app.use(morgan('dev'));
  await app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
  });
}
bootstrap();
