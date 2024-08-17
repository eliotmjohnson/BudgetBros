import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(
  AppModule, 
  { providers: [provideDateFnsAdapter()] }
)
  .catch(err => console.error(err));
