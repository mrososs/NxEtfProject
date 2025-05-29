import { Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateStore,
  TranslateService,
  TranslateCompiler,
  TranslateParser,
  TranslateFakeCompiler,
  TranslateDefaultParser,
  MissingTranslationHandler,
  FakeMissingTranslationHandler,
  USE_DEFAULT_LANG,
  USE_EXTEND
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LangService } from 'shared/src/lib/services/lang.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const TRANSLATE_PROVIDERS: Provider[] = [
  TranslateStore,
  TranslateService,
  LangService,
  {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
  {
    provide: TranslateCompiler,
    useClass: TranslateFakeCompiler,
  },
  {
    provide: TranslateParser,
    useClass: TranslateDefaultParser,
  },
  {
    provide: MissingTranslationHandler,
    useClass: FakeMissingTranslationHandler,
  },
  // Add the missing injection tokens
  {
    provide: USE_DEFAULT_LANG,
    useValue: true, // or false, depending on your needs
  },
  {
    provide: USE_EXTEND,
    useValue: true,
  },
];