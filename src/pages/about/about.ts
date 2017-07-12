import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

/**
 * Generated class for the AboutPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  device: string;
  appName: string;
  packageName: string;
  versionCode: string;
  versionNumber: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform, private appVersion: AppVersion) {
    this.device=this.platform.navigatorPlatform();
    switch (this.device) {
      case 'MacIntel':
      case 'Win32':
      case 'Win16':
        break;
      default:
        this.appVersion.getAppName()
          .then(name => {
            this.appName = name;
          });
        this.appVersion.getPackageName()
          .then(name => {
            this.packageName = name;
          });
        this.appVersion.getVersionCode()
          .then(code => {
            this.versionCode = code;
          });
        this.appVersion.getVersionNumber()
          .then(number => {
            this.versionNumber = number;
          });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }
}