import { Component, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Injectable()
@Component({
  selector: 'page-thanks',
  templateUrl: 'thanks.html',
})
export class ThanksPage {
  browser: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private iab: InAppBrowser, 
    public platform: Platform) {
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ThanksPage');
  }
  openUrl(url){
    this.platform.ready().then(() => {
      this.browser = this.iab.create(url);
      this.browser.show();
    });
  }
}
