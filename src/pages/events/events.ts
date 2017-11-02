import { Component, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Injectable()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  browser: any;

  linklist = new Set();
  hasLinkList:boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private iab: InAppBrowser, 
    public platform: Platform,
    private storage: Storage,
  ) {
  }
  ionViewDidLoad() {
    // console.log('ionViewDidLoad EventsPage');
    this.storage.get("linklist")
    .then(
    stat => {
      // console.log("linklist:");
      // console.log(stat);
      var obj = JSON.parse(stat);
      if (obj.length > 0) {
        for (var j = 0; j < obj.length; j++) {
          this.linklist.add(obj[j]);
        }
        // console.log("this.linklist:");
        // console.log(this.linklist);
        this.hasLinkList = true;
      }
    });
  }
  openUrl(url){
    this.platform.ready().then(() => {
      this.browser = this.iab.create(url);
      this.browser.show();
    });
  }
}
