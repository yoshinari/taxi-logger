import { Component, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PhonelistPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({
  // name: 'phonelist',
  segment: 'phone-list'
})
@Injectable()
@Component({
  selector: 'page-phonelist',
  templateUrl: 'phonelist.html',
})
export class PhonelistPage {
  browser: any;

  phonelist = new Set();
  hasPhoneList:boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public platform: Platform,
    private storage: Storage,
  ) {
  }

  ionViewDidLoad() {
    this.storage.get("phonebook")
    .then(
    stat => {
      if (stat === null){
        return;
      }
      var obj = JSON.parse(stat);
      if (obj.length > 0) {
        for (var j = 0; j < obj.length; j++) {
          this.phonelist.add(obj[j]);
        }
        this.hasPhoneList = true;
      }
    });
  }
}

