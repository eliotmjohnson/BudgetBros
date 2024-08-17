import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';


platformBrowserDynamic().bootstrapModule(
  AppModule, 
  { providers: [provideDateFnsAdapter()] }
)
  .catch(err => console.error(err));
