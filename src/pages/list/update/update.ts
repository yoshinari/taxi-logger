import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DetailPage } from '../detail/detail';
import { DbProvider } from '../../../providers/db/db';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ToastController } from 'ionic-angular';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Http } from '@angular/http';


/**
 * Generated class for the UpdatePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-update',
  templateUrl: 'update.html',
})
export class UpdatePage {
  rootPage: any;
  date: string;
  number: number;

  history = new Set();
  hasHistory: boolean = false;
  viaHistory = new Set();
  orgViaString: string;
  viaString: string;
  hasViaHistory: boolean = false;
  errorMSG: string;

  original = {};
  update = {};

  street: string;
  houseNumber: string;
  city: string;
  district: string;
  countryName: string;
  countryCode: string;
  address: string;
  postalCode: string;
  isUseZipCloud: boolean = false;

  browser: any;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private storage: Storage,
    private db: DbProvider,
    private iab: InAppBrowser,
    public toastCtrl: ToastController,
    public platform: Platform,
    private nativeGeocoder: NativeGeocoder,
    private http: Http,
  ) {
    this.date = navParams.get('date');
    this.number = navParams.get('number');
    this.rootPage = DetailPage;
    // isUseZipCloud
    this.storage.get("isUseZipCloud")
    .then(
    stat => {
      this.isUseZipCloud = stat;
    });
  }
  ionViewDidLoad() {
    this.db.getDetailLog(this.date, this.number)
      .then(data => {
        this.history = new Set();
        this.viaHistory = new Set();
        if (data === undefined) {
          this.hasHistory = false;
        } else {
          for (var i = 0; i < data.length; i++) {
            this.history.add(data[i]);
            this.original = data[i];
            if (data[i]["ViaData"]) {
              this.orgViaString = data[i]["ViaData"];
              var obj = JSON.parse(data[i]["ViaData"]);
              if (obj.length > 0) {
                for (var j = 0; j < obj.length; j++) {
                  obj[j]["history"] = data[i]["Number"];
                  this.viaHistory.add(obj[j]);
                }
              }
              this.hasViaHistory = true;
            }
          }
          this.hasHistory = true;
        }
      });
  }
  updateForm() {
    this.history.forEach(function (value) {
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          switch (key) {
            case "GetInAddress":
            case "GetInMemo":
            case "GetOutAddress":
            case "GetOutMemo":
            case "ViaMemo":
              this.update[key] = value[key];
          }
        }
      }
      console.log("this.update:");
      console.log(this.update);
    }, this);
    this.viaString = "[";
    this.viaHistory.forEach(function (value) {
      if (this.viaString !== "[") {
        this.viaString += ",";
      }
      this.viaString += '{"date":"' + value['date'] + '","time":"' + value['time'] + '","lat":' + value['lat'] + ',"lng":' + value['lng'] + ',"country":"' + value['country'] + '","postal":"' + value['postal'] + '","address":"' + value['address'] + '","memo":"' + value['memo'] + '"}';
    }, this);
    this.viaString += ']';
    if (Object.keys(this.update).length === 0 && this.viaString === this.orgViaString) {
      console.log('No Update!');
    } else {
      console.log('Need to update ' + this.date + ' ' + this.number);
      this.db.updateLog(this.date, this.number, this.update, this.viaString)
        .then(data => {
          console.log("update done.");
          console.log(data);
          this.navCtrl.pop();
          let toast = this.toastCtrl.create({
            message: '履歴を更新しました',
            duration: 2000
          });
          toast.present();
        }).catch(error => {
          console.error(error);
        })
    }
  }
  alertReverseGeocode(lat, lng) {
    if (lat < 0 || lng < 0) {
      console.log('lat or lng has bad data. lat:' + lat + ', lng:' + lng);
      let alert = this.alertCtrl.create({
        title: '位置情報を表示できません。',
        subTitle: '緯度、軽度の情報が記録されていません(lat:' + lat + ', lng:' + lng + ')',
        buttons: ['OK']
      });
      alert.present();
      return false;
    }

    this.nativeGeocoder.reverseGeocode(lat, lng)
      .then((result: NativeGeocoderReverseResult) => {
        var geoData = JSON.stringify(result);
        if (this.isUseZipCloud && result.postalCode != ""){
          this.http.get('http://zipcloud.ibsnet.co.jp/api/search?zipcode='+result.postalCode)
          .map((res) => {
            if (res.json().status == 200){
              geoData = (geoData + "<br>" + JSON.stringify(res.json().results[0])).replace(/\,/g,"<br>").replace(/{/g,"{<br>").replace(/}/g,"<br>}");
              }
              let alert = this.alertCtrl.create({
                title: '位置情報',
                subTitle: geoData,
                buttons: ['OK']
              });
              alert.present();
            }
          )
          .subscribe(data => {},
          err => console.log(err));
          } else {
            geoData = geoData.replace(/\,/g,"<br>").replace(/{/g,"{<br>").replace(/}/g,"<br>}");
            let alert = this.alertCtrl.create({
            title: '位置情報',
            subTitle: geoData,
            buttons: ['OK']
          });
          alert.present();
        }})
      .catch((error: any) => {
        console.error(error);
        let alert = this.alertCtrl.create({
          title: '位置情報エラー',
          subTitle: error.message,
          buttons: ['OK']
        });
        alert.present();
      });
    return false; // formのsubmitをしないためにはreturn falseであること
  }
  openGoogleMap(lat, lng) {
    console.log('GetAddr : lat: ' + lat + ' lng:' + lng);
    if (lat < 0 || lng < 0) {
      console.log('lat or lng has bad data. lat:' + lat + ', lng:' + lng);
      let alert = this.alertCtrl.create({
        title: 'Google Mapを表示できません。',
        subTitle: '緯度、軽度の情報が記録されていません(lat:' + lat + ', lng:' + lng + ')',
        buttons: ['OK']
      });
      alert.present();
      return false;
    }
    this.platform.ready().then(() => {
      this.browser = this.iab.create("http://maps.google.com/maps?q=" + lat + "," + lng);
      this.browser.show();
    });
    return false; // formのsubmitをしないためにはreturn falseであること
  }
}