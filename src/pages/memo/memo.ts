import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the MemoPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-memo',
  templateUrl: 'memo.html',
})
export class MemoPage {

  browser: any;

  memo = new Set();
  hasMemo:boolean = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public platform: Platform,
    private storage: Storage,
  ) {
  }

  ionViewDidLoad() {
    this.storage.get("memo")
    .then(
    stat => {
      if (stat === null){
        return;
      }
      var obj = JSON.parse(stat);
      if (obj.length > 0) {
        for (var j = 0; j < obj.length; j++) {
          this.memo.add(obj[j]);
        }
        this.hasMemo = true;
      }
    });
  }
}
