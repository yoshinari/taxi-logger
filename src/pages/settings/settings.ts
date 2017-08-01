import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  isRemindUsingTrunkRoom: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage
  ) {
    this.storage.get("isRemindUsingTrunkRoom")
      .then(
      stat => {
        this.isRemindUsingTrunkRoom = stat;
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }
  updateUsingTrunkRoom() {
    console.log('updateUsingTrunkRoom:');
    console.log('isRemindUsingTrunkRoom:' + this.isRemindUsingTrunkRoom);
    this.storage.set("isRemindUsingTrunkRoom", this.isRemindUsingTrunkRoom);
  }

}
