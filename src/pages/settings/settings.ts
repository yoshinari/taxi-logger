import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
// import 'rxjs/add/operator/map';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
// @Injectable()
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  isRemindUsingTrunkRoom: boolean = false;
  isUsingTrunkRoom: boolean = false;
  isShowAltitude: boolean = false;
  region: { [key: string]: any; } = {};
  regionSelect = new Set()
  regSelected: number = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private http: Http,
  ) {
    this.storage.get("isRemindUsingTrunkRoom")
      .then(
      stat => {
        this.isRemindUsingTrunkRoom = stat;
      });
      // isUsingTrunkRoom
      this.storage.get("isUsingTrunkRoom")
      .then(
      stat => {
        this.isUsingTrunkRoom = stat;
      });
      // isShoAltitude
      this.storage.get("isShowAltitude")
      .then(
      stat => {
        this.isShowAltitude = stat;
      });
      this.storage.get("regSelected")
      .then(
      stat => {
        if (stat !== null){
          this.regSelected = stat;
        }
      });
      this.http.get('./assets/config/config.json')
      .map((res) => {
        // res.json();
        // console.log(res.json());
        // this.region = res.json().region;
        this.regionSelect = new Set();
        for (var reg in res.json().region) {
          this.regionSelect.add(res.json().region[reg].name);
        }
      })
      .subscribe();
      // err => console.log(err));
    }


  ionViewDidLoad() {
    // console.log('ionViewDidLoad SettingsPage');
  }
  updateUsingTrunkRoom() {
    // console.log('updateUsingTrunkRoom:');
    // console.log('isRemindUsingTrunkRoom:' + this.isRemindUsingTrunkRoom);
    this.storage.set("isRemindUsingTrunkRoom", this.isRemindUsingTrunkRoom);
  }
  updateShowAltitude(){
    this.storage.set("isShowAltitude", this.isShowAltitude);
  }
  regOptionChange(reg) {
    // console.log(reg);
    this.storage.set("regSelected", reg);
    if (reg == 0){
      this.storage.set("regPCode", "^([0-9])");
      return;
    }

    this.http.get('./assets/config/config.json')
    .map((res) => {
      this.region = res.json().region;
      // console.log(this.region[reg].pcode);
      this.storage.set("regPCode", this.region[reg].pcode)
      .then(_ =>
      this.storage.get("regPCode")
      .then(
      stat => {
        // console.log("regPCode:"+stat);
      }));
    })
    .subscribe();

    var pcode = "242-0001";
    var regexp = new RegExp('');
    var test = regexp.test(pcode);
    // console.log(test);
    pcode = "112-1453";
    test = regexp.test(pcode);
    // console.log(test);
  }
}
