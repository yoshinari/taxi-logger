import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { EmailComposer } from '@ionic-native/email-composer';
import { Device } from '@ionic-native/device';

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {
  navPlat: string;
  appInfo: string = "";
  deviceInfo: string = "";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private emailComposer: EmailComposer,
    private platform: Platform,
    private appVersion: AppVersion,
    private device: Device,
  ) {
    this.navPlat = this.platform.navigatorPlatform();
    switch (this.navPlat) {
      case 'MacIntel':
      case 'Win32':
      case 'Win16':
        break;
      default:
        this.appVersion.getAppName()
          .then(name => {
            this.appInfo += "Application Name:" + name + "<br>";
          });
        this.appVersion.getPackageName()
          .then(name => {
            this.appInfo += "Package Name:" + name + "<br>";
          });
        this.appVersion.getVersionCode()
          .then(code => {
            this.appInfo += "Version Code:" + code + "<br>";
          });
        this.appVersion.getVersionNumber()
          .then(number => {
            this.appInfo += "Version Number:" + number + "<br>";
          });
    }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
    this.emailComposer.isAvailable().then(function () {
      console.log("email available");
    }, function () {
      console.log("email not available");
    });
    console.log("Device:");
    console.log(this.device);

    this.deviceInfo = "cordova: " + this.device.cordova
      + "<br>manufacturer: " + this.device.manufacturer
      + "<br>model: " + this.device.model
      + "<br>platform: " + this.device.platform
      + "<br>version: " + this.device.version
      + "<br>innerWidth: " + window.innerWidth
      + "<br>innerHeight: " + window.innerHeight
      + "<br>outerWidth: " + window.outerWidth
      + "<br>outerHeight: " + window.outerHeight;
  }
  feedback() {
    console.log("Send feedback");
    let email = {
      to: 'itaxi.tokyo+taxi-logger@gmail.com',
      subject: '【taxi-logger】フィードバック',
      body: 'ご意見、ご感想:<br><br><br><br><br><br>===<br>Application Info:<br>' + this.appInfo + '<br>Device Info:<br>' + this.deviceInfo,
      isHtml: true
    };
    this.emailComposer.open(email);
  }
}
