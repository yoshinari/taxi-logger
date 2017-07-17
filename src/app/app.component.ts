import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoggerPage } from '../pages/logger/logger';
import { TinyCalcPage } from '../pages/tiny-calc/tiny-calc';
import { SettingsPage } from '../pages/settings/settings';
import { ThanksPage } from '../pages/thanks/thanks';
import { AboutPage } from '../pages/about/about';
import { EventsPage } from '../pages/events/events';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'Taxi Logger', component: LoggerPage },
      { title: '簡易料金計算', component: TinyCalcPage },
      { title: '乗務履歴', component: ListPage },
      { title: '設定', component: SettingsPage },
      { title: 'イベントスケジュール', component: EventsPage },
      { title: 'Thanks', component: ThanksPage },
      { title: 'Taxi Loggerについて', component: AboutPage },
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
