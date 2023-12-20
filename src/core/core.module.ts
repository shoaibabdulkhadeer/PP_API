import { Global, Module } from '@nestjs/common';
import { exportProviders, getProviders, importProviders } from './providers';

@Global()
@Module({
	providers: [...getProviders()],
	imports: [...importProviders()],
	exports: [...exportProviders()]
})
export class CoreModule {}
