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

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';

import { TimerProvider } from '../providers/timer/timer';
import { PendingProvider } from '../providers/pending/pending';
import { DbProvider } from '../providers/db/db';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoggerPage,
    TinyCalcPage,
    SettingsPage,
    ThanksPage,
    AboutPage
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
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TimerProvider,
    PendingProvider,
    DbProvider,
  ]
})
export class AppModule {}
