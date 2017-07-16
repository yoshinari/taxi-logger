import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DetailPage } from '../detail/detail';
import { DbProvider } from '../../../providers/db/db';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';

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

  street:string;
  houseNumber:string;
  city:string;
  district:string;
  countryName:string;
  countryCode:string;
  address:string;
  postalCode:string;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private db: DbProvider,
    private nativeGeocoder: NativeGeocoder,
  ) {
    this.date = navParams.get('date');
    this.number = navParams.get('number');
    this.rootPage = DetailPage;
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
        }).catch(error => {
          console.error(error);
        })
    }
  }
  getAdder(lat, lng, pos) {
    console.log('GetAddr : lat: '+lat+ ' lng:' + lng + 'pos:' + pos);
    // this.update['GetInAddress']="hoge";
    // posがViaDataの時の処理がすごく大変そう
    this.nativeGeocoder.reverseGeocode(lat, lng)
            .then((result: NativeGeocoderReverseResult) => {
              console.log(result);
              if (result.street === undefined) {
                this.street = "";
              } else {
                this.street = result.street;
              }
              if (result.houseNumber === undefined) {
                this.houseNumber = "";
              } else {
                this.houseNumber = result.houseNumber;
              }
              if (result.city === undefined) {
                this.city = "";
              } else {
                this.city = result.city;
              }
              if (result.district === undefined) {
                this.district = "";
              } else {
                this.district = result.district;
              }
              if (result.countryName === undefined) {
                this.countryName = "";
              } else {
                this.countryName = result.countryName;
              }
              if (result.countryCode === undefined) {
                this.countryCode = "";
              } else {
                this.countryCode = result.countryCode;
              }
              if (result.postalCode === undefined) {
                this.address += "*";
                this.postalCode = "";
              } else {
                this.postalCode = result.postalCode;
                this.address = this.city + this.district + this.street + this.houseNumber;
              }
              this.errorMSG = "";
              console.log("Address:::::"+this.address);
            })
            .catch((error: any) => {
              console.error(error);
              this.errorMSG = error.message;
            });
    return false; // formのsubmitをしないためにはreturn falseであること
  }
}