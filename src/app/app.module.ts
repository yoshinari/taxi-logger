import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoggerPage } from '../pages/logger/logger';
import { TinyCalcPage } from '../pages/tiny-calc/tiny-calc';
import { SettingsPage } from '../pages/settings/settings';
import { ThanksPage } from '../pages/thanks/thanks';
import { AboutPage } from '../pages/about/about';
import { EventsPage } from '../pages/events/events';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';

import { TimerProvider } from '../providers/timer/timer';
import { PendingProvider } from '../providers/pending/pending';
import { DbProvider } from '../providers/db/db';
import { AppVersion } from '@ionic-native/app-version';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoggerPage,
    TinyCalcPage,
    SettingsPage,
    ThanksPage,
    AboutPage,
    EventsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'taxiLoggerDB',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoggerPage,
    TinyCalcPage,
    SettingsPage,
    ThanksPage,
    AboutPage,
    EventsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TimerProvider,
    PendingProvider,
    DbProvider,
    AppVersion,
    Geolocation,
    NativeGeocoder,
    InAppBrowser,
  ]
})
export class AppModule {}
