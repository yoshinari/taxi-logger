import { Component } from '@angular/core';
import { AlertController, NavController, IonicPage, NavParams, Platform } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DbProvider } from '../../../providers/db/db';
import { HistoryPage } from '../history/history';
import { AppAvailability } from '@ionic-native/app-availability';

@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  rootPage: any;
  date: string;
  number: number;

  history = new Set();
  hasHistory: boolean = false;
  viaHistory = new Set();
  hasViaHistory: boolean = false;
  errorMSG: string;

  mapUrl: string;
  browser: any;

  tweetMSG: string = "";
  isTwitter: boolean = false;
  isTweetCaster: boolean = false;
  isFacebook: boolean = false;
  isFacebookMessenger: boolean = false;
  isLine: boolean = false;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private db: DbProvider,
    private iab: InAppBrowser,
    public platform: Platform,
    private socialSharing: SocialSharing,
    private appAvailability: AppAvailability,
  ) {
    this.date = navParams.get('date');
    this.number = navParams.get('number');
    this.rootPage = HistoryPage;

    this.appAvailability.check('com.twitter.android')
      .then(
      () => {
        this.isTwitter = true;
      });
    this.appAvailability.check('com.handmark.tweetcaster')
      .then(
      () => {
        this.isTweetCaster = true;
      });
    this.appAvailability.check('com.facebook.katana')
      .then(
      () => {
        this.isFacebook = true;
      });
    this.appAvailability.check('com.facebook.orca')
      .then(
      () => {
        this.isFacebookMessenger = true;
      });
      this.appAvailability.check('jp.naver.line.android')
      .then(
      () => {
        this.isLine = true;
      });
  }

  ionViewDidEnter() {
    this.db.getDetailLog(this.date, this.number)
      .then(data => {
        this.history = new Set();
        this.viaHistory = new Set();
        if (data === undefined) {
          this.hasHistory = false;
        } else {
          for (var i = 0; i < data.length; i++) {
            this.history.add(data[i]);
            if (data[i]["ViaData"]) {
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
  deleteHistoryData() {
    let alert = this.alertCtrl.create({
      title: '確認',
      message: this.date + 'の乗務履歴を削除します。<br>本当に削除しますか？',
      buttons: [
        {
          text: 'キャンセル',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: '削除する',
          handler: () => {
            this.db.deleteLog(this.date)
              .then(xxx => {
                console.log("DELETED!!");
                this.navCtrl.pop();
              })
              .catch(error => {
                console.error(error);
              });
          }
        }
      ]
    });
    alert.present();
  }
  popView() {
    this.navCtrl.remove(1);
  }
  updateData(event, date, number) {
    this.navCtrl.push('UpdatePage', { date: date, number: number });
  }
  shareData(event, date, number, appTitle, appName) {
    // com.handmark.tweetcaster
    // "com.facebook.katana":Facebook
    // "com.facebook.orca" : Facebook Messenger
    // appNameが無効であれば、アラートを表示して終了する。
    // jp.naver.line.android
    this.socialSharing.canShareVia(appName)
      .then(data => {
        console.log('appName: data');
        console.log(data);
      })
      .catch(error => {
        console.log('appName:' + appName + '(appTitle:' + appTitle + ')がインストールされていません');
        console.log(error);
        let alert = this.alertCtrl.create({
          title: '残念',
          subTitle: appTitle + 'がインストールされていません。',
          buttons: ['OK']
        });
        alert.present();
        return false;
      });
    this.db.getDetailLog(this.date, this.number)
      .then(data => {
        this.history = new Set();
        this.viaHistory = new Set();
        if (data === undefined) {
          this.hasHistory = false;
        } else {
          for (var i = 0; i < data.length; i++) {
            console.log(data[i]);
            if (data[i]["GetInLat"] < 0 || data[i]["GetInLng"] < 0 || data[i]["GetOutLat"] < 0 || data[i]["GetOutLng"] < 0) {
              console.log("位置情報が保存されていません。");
              let alert = this.alertCtrl.create({
                title: '残念',
                subTitle: '位置情報が保存されていないため、GoogleMapでの経路表示が出来ません。',
                buttons: ['OK']
              });
              alert.present();
              return false;
            } else {
              var appUrl = "https://itaxi.tokyo/app/taxi-logger/";
              var ymd = data[i]["GetInDate"].split('-');
              var hms = data[i]["GetInTime"].split(':');
              this.tweetMSG = ymd[1] + "月" + ymd[2] + "日 " + hms[0] + "時" + hms[1] + "分に【" + data[i]["GetInShortAddress"] + "】で乗車され、【" + data[i]["GetOutShortAddress"] + "】までお送りしました。";
              this.tweetMSG += "#taxi_logger #タクログ";
              if (appName == 'com.twitter.android') {
                this.socialSharing.shareViaTwitter(this.tweetMSG, "", appUrl)
                  .then(data => {
                    console.log("data:");
                    console.log(data);
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else if (appName == "com.facebook.katana") {
                this.socialSharing.shareViaFacebook(this.tweetMSG,"",appUrl)
                  .then(data => {
                    console.log("data:");
                    console.log(data);
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                // this.socialSharing.shareViaInstagram(this.tweetMSG, "")  // for debug
                this.socialSharing.shareVia(appName, this.tweetMSG, "", "", appUrl)
                  .then(data => {
                    console.log("data:");
                    console.log(data);
                  })
                  .catch(error => {
                    console.log(error);
                  })
              }
            }
          }
        }
      });
    //ページの状態を戻すためのトリック
    this.navCtrl.push('DetailPage', { date: date, number: number });
    this.navCtrl.pop();
  }
  showViaGoogleMap(event, date, number) {
    console.log("Show Via GoogleMap");
    this.db.getDetailLog(this.date, this.number)
      .then(data => {
        this.history = new Set();
        this.viaHistory = new Set();
        if (data === undefined) {
          this.hasHistory = false;
        } else {
          for (var i = 0; i < data.length; i++) {
            console.log(data[i]);
            if (data[i]["GetInLat"] < 0 || data[i]["GetInLng"] < 0 || data[i]["GetOutLat"] < 0 || data[i]["GetOutLng"] < 0) {
              console.log("位置情報が保存されていません。");
              let alert = this.alertCtrl.create({
                title: '残念',
                subTitle: '位置情報が保存されていないため、GoogleMapでの経路表示が出来ません。',
                buttons: ['OK']
              });
              alert.present();
            } else {
              this.mapUrl = 'http://www.google.co.jp/maps/dir';
              this.mapUrl += '/' + data[i]["GetInLat"] + ',' + data[i]["GetInLng"];
              if (data[i]["ViaData"]) {
                var obj = JSON.parse(data[i]["ViaData"]);
                if (obj.length > 0) {
                  for (var j = 0; j < obj.length; j++) {
                    obj[j]["history"] = data[i]["Number"];
                    if (obj[j]["lat"] > 0 && obj[j]["lng"] > 0) {
                      this.mapUrl += '/' + obj[j]["lat"] + ',' + obj[j]["lng"];
                    }
                  }
                }
              }
              this.mapUrl += '/' + data[i]["GetOutLat"] + ',' + data[i]["GetOutLng"];
              this.mapUrl += '/@/data=!4m2!4m1!3e0';
              console.log("mapUrl: " + this.mapUrl);
              this.platform.ready().then(() => {
                this.browser = this.iab.create(this.mapUrl, '_self', { location: 'no', hardwareback: 'no' });
                // https://forum.ionicframework.com/t/inappbrowser-ionic2-how-to-change-design-of-browser/70552
                this.browser.on("loadstop")
                  .subscribe(
                  () => {
                    this.browser.insertCSS({
                      code:
                      ".ml-directions-center-panel,.ml-directions-searchbox-tabs {display: none;}"
                    });
                    this.browser.show();
                  },
                  err => {
                    console.log("InAppBrowser Loadstop Event Error: " + err);
                  });
              });
            }
          }
        }
      });
    //ページの状態を戻すためのトリック
    this.navCtrl.push('DetailPage', { date: date, number: number })
    .then(_ => {
      this.navCtrl.pop();
    });
  }
}