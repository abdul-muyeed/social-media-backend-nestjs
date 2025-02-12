import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 3000;
  app.use(morgan('dev'));
  await app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
  });
}
bootstrap();
