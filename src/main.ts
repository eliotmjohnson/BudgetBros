import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './app/interceptors/http.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([httpInterceptor])),
        provideNativeDateAdapter()
    ]
});
