import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TimerProvider } from '../../providers/timer/timer';
import { PendingProvider } from '../../providers/pending/pending';
import { DbProvider } from '../../providers/db/db';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult } from '@ionic-native/native-geocoder';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { DatePicker } from '@ionic-native/date-picker';

/**
 * Generated class for the LoggerPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-logger',
  templateUrl: 'logger.html',
})
export class LoggerPage {

  expiredDate: string = "2017-12-31"; // このアプリの利用期限の設定 : この期限を過ぎると新しいレコードを登録できない。
  latLngDiffRatio: number = 5000; // 移動を判断するためのパラメータ　以前は500。数字が大きいほどセンシティブ
  requests: number = 0;
  results: number = 0;
  errors: number = 0;

  isExpired: boolean = false;

  driveDate: any; // Date and String
  month: any; // Number and String
  day: any; // Number and String
  CarUnloadingTime: any; // 出庫 Car unloading
  CarReturnBoxTime: any; // 帰庫 Car return box

  clock: { [key: string]: string } = {};
  logData: { [key: string]: string } = {};

  workingTime: string = "00:00:00";
  working: any = null;

  isWorking: boolean = false;

  drivingTime: string;
  driving: any = null;

  isDriving: boolean = false;

  breakTime: string;
  break: any;

  isBreak: boolean = false;

  elapsedBreakTime: string;
  elapsedDisplayTime: string = "00:00:00";

  timerID: number;
  timer: Date;
  timeString: string;

  old: number;
  now: Date;
  hours: number;
  mins: number;
  secs: number;

  hms: number[];

  pending: { [key: string]: any; } = {};
  requires: number = 1; // readyがrequiresになればDISABLEが解除される
  ready: number = 0;

  isGetIn: boolean = false;
  isVia: boolean = false;
  isGetOut: boolean = false;
  isCancel: boolean = false;
  isRegist: boolean = false;

  history = new Set();
  hasHistory: boolean = false;
  viaHistory = new Set();
  errorMSG: string;

  // GeoLocation関連

  lat: number;
  lng: number;
  tmpLat: number;
  tmpLng: number;
  altitude: number = 0;
  accuracy: number;
  speed: number;
  address: string = "";
  shortAddress: string = "";
  street: string = "";
  houseNumber: string = "";
  postalCode: string = "";
  city: string = "";
  district: string = "";
  countryName: string = "";
  countryCode: string = "";
  geoData: string = "";

  isRemindUsingTrunkRoom: boolean = false;
  isUsingTrunkRoom: boolean = false;
  isShowAltitude: boolean = false;
  isUseZipCloud: boolean = false;
  breakReset: string = "00:00:00";

  browser: any;

  // regPCode: string = "";
  regexp = new RegExp("^([0-9])");
  outOfRegion: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private storage: Storage,
    private timerProvider: TimerProvider,
    private pendingProvider: PendingProvider,
    public db: DbProvider,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private iab: InAppBrowser,
    private platform: Platform,
    private datePicker: DatePicker,
    private http: Http,
  ) {
    // 使用期限の設定
    // expiredDate: string = "2017-08-05"; // このアプリの利用期限の設定 : この期限を過ぎると新しいレコードを登録できない。
    //   isExpired: boolean = false;
    let date = new Date();
    let today = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).substr(-2) + "-" + ("0" + date.getDate()).substr(-2);
    // console.log("today:" + today);
    if (today > this.expiredDate) {
      this.isExpired = true;
      console.log("expired");
    }
    this.storage.get("regPCode")
    .then(
    stat => {
      if (stat == null){
        stat = "^([0-9])";
      }
      this.regexp = new RegExp(stat);
    });

    this.storage.get("isRemindUsingTrunkRoom")
      .then(
      stat => {
        this.isRemindUsingTrunkRoom = stat;
      });
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
    // isUseZipCloud
    this.storage.get("isUseZipCloud")
    .then(
    stat => {
      this.isUseZipCloud = stat;
    });
    this.storage.get("breakReset")
      .then(
      stat => {
        this.breakReset = stat;
      });
    this.startTimer();
  }
  jobCloseoutConfirm() {
    let alert = this.alertCtrl.create({
      title: '確認',
      message: '総休憩時間をリセットします。<br>本日の乗務を終了しますか？',
      buttons: [
        {
          text: 'キャンセル',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: '終了する',
          handler: () => {
            this.stopDrivingTime();
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LoggerPage');
    // this.resetStorage();

    // 日付がストレージに保存されていない場合、今日の日付を設定する
    this.timerProvider.getDriveDate(this.driveDate)
      .then(
      date => {
        this.driveDate = date;
        this.getLog();
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      });

    // 出庫時間がストレージに保存されていない場合、初期値を設定する
    this.timerProvider.getTime("CarUnloadingTime", "07:00")
      .then(
      time => {
        this.CarUnloadingTime = time;
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      });

    // 帰庫時間がストレージに保存されていない場合、初期値を設定する
    this.timerProvider.getTime("CarReturnBoxTime", "03:00")
      .then(
      time => {
        this.CarReturnBoxTime = time;
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      });
    this.loadElapsedBreakTime(this.breakTime);
    // isDrivingの設定
    this.timerProvider.loadTimer("drivingTime", "drivingStartTime")
      .then(
      time => {
        this.drivingTime = time;
        if (this.drivingTime && this.drivingTime != "00:00:00") {
          //   // 運転中なので、タイマーを動かす
          this.startDrivingTime(false);
          this.isDriving = true;
        }
      },
      error => {

      });

    this.timerProvider.loadTimer("breakTime", "breakStartTime")
      .then(
      time => {
        this.breakTime = time;
        if (this.breakTime && this.breakTime != "00:00:00") {
          //   // 休憩中なので、タイマーを動かす
          this.startBreakTime(false);
          this.isBreak = true;
        }
      },
      error => {

      });


    // 仕掛中データの取得
    this.storage.get("pending")
      .then(
      pending => {
        if (pending === null) {
          this.pending = this.pendingProvider.initPending();
        } else {
          this.pendingProvider.loadPending(pending);
          this.pending = pending;
        }
        this.updatePending();
        this.ready++;
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );

    //
    // GeoLocation関連 providerを作成したほうが良いかな？
    //
    this.lat = this.lng = this.accuracy = this.speed = -1;
    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // console.log("data.coords:");
      // console.log(data.coords);
      if (data.coords === undefined) {
        // console.warn("data.coords undefined");
        this.tmpLat = this.tmpLng = this.accuracy = this.speed = -1;
      } else {
        this.tmpLat = data.coords.latitude;
        this.tmpLng = data.coords.longitude;
        this.accuracy = data.coords.accuracy;
        this.altitude = data.coords.altitude;
        this.speed = data.coords.speed;
        if (this.tmpLat > 0 && this.tmpLng > 0
          && (Math.round(this.lat * this.latLngDiffRatio) != Math.round(this.tmpLat * this.latLngDiffRatio) || Math.round(this.lng * this.latLngDiffRatio) != Math.round(this.tmpLng * this.latLngDiffRatio))
        ) {
          this.lat = this.tmpLat;
          this.lng = this.tmpLng;
          this.requests++;
          this.nativeGeocoder.reverseGeocode(this.tmpLat, this.tmpLng)
            .then((result: NativeGeocoderReverseResult) => {
              this.results++;
              // console.log(result);
              this.geoData = "city:" + result.city
                + ", countryCode:" + result.countryCode
                + ", countryName:" + result.countryName
                + ", district:" + result.district
                + ", houseNumber:" + result.houseNumber
                + ", postalCode:" + result.postalCode
                + ", street:" + result.street;
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
                this.errorMSG = "city:" + result.city + " district:" + this.district + " street:" + this.street + " houseNumber:" + this.houseNumber;
                this.postalCode = "";
              } else {
                this.postalCode = result.postalCode;
                var test = this.regexp.test(this.postalCode);
                this.outOfRegion = !test;
                if (
                  this.street.endsWith("丁目")
                ) {
                  this.address = this.city + this.district + this.street + this.houseNumber;
                } else if (
                  this.street.endsWith("通り")
                  || this.street.endsWith("号線")
                  || this.street.endsWith("街道")
                ) {
                  this.address = this.city + this.district + "(" + this.street + ")";
                } else if (this.street == "Unnamed Road") {
                  this.address = this.city + this.district;
                } else if (this.street == "") {
                  this.address = this.city + this.district + this.houseNumber;
                } else {
                  this.address = this.city + this.district + "(" + this.street + ")" + this.houseNumber;
                }
                this.shortAddress = this.city + this.district;
              }
              this.errorMSG = "";
            })
            .catch((error: any) => {
              this.errors++;
              console.error(error);
              this.errorMSG = error.message;
            });
        } else if (this.tmpLat == -1 || this.tmpLng == -1) {
          console.error("tmpLat or tmpLng error: tmpLat:" + this.tmpLat + " tmpLng:" + this.tmpLng);
          this.errorMSG = "tmpLat or tmpLng error: tmpLat:" + this.tmpLat + " tmpLng:" + this.tmpLng;
        }
        this.errorMSG = "REQ:" + this.requests + " RES:" + this.results + " ERR:" + this.errors;
      }
    });
  }

  startTimer() {
    // 全体のタイマー
    this.timerID = setInterval(() => {
      this.clock = this.timerProvider.showClock();  // 時計
      if (this.isDriving || this.isBreak){
        // 乗務時間
        this.timerProvider.loadTimer("workingTime", "workingStartTime")
        .then(
          time => {
            this.workingTime = time;
          },
          error => {
            
          });;
        // 連続走行時間
        this.timerProvider.loadTimer("drivingTime", "drivingStartTime")
        .then(
          time => {
            this.drivingTime = time;
          },
          error => {

          });;
        // 休憩時間
        if (this.isBreak) {
          this.timerProvider.loadTimer("breakTime", "breakStartTime")
          .then(
            time => {
              this.breakTime = time;
            },
            error => {

          });;
          this.loadElapsedBreakTime(this.breakTime);
          if (this.breakTime >= this.breakReset) { // 設定時間以上連続して休憩したら、連続走行時間をリセットする。　"00:15:00") {  // 15分以上連続して休憩したら、連続走行時間をリセットする。
            this.stopDrivingTime(false);
          }
        }
      }
    }, 1000);
  }

  startDrivingTime(init: boolean = true) {
    // console.log("init:" + init);
    // console.log("driving:" + this.driving);
    // console.log("working:" + this.working);
    if (init || (this.driving === void 0) || (this.driving === null)) {
      this.workingTime = "00:00:00";
      if (this.drivingTime === void 0 || this.drivingTime == "00:00:00") {
        // console.log("setTimer(drivingStartTime)");
        this.setTimer("drivingStartTime");
      }
      if (init) {
        // console.log("setTimer(workingStartTime)");
        this.setTimer("workingStartTime");
      }
      // this.driving = setInterval(this.drivingTimer, 1000);
      if (this.working === void 0 || (this.working == null)) {
        // this.working = setInterval(this.workingTimer, 1000);
        this.isWorking = true;
      }
    }
    this.isDriving = true;
  }
  stopDrivingTime(isAllReset: boolean = true) {
    if (this.drivingTime != "00:00:00") {
      clearInterval(this.driving);
      this.isDriving = false;
      this.driving = null;
      this.resetTimer("drivingStartTime");
      this.drivingTime = "00:00:00";
      if (isAllReset) {
        clearInterval(this.working);
        this.resetTimer("elapsedBreak");
        this.elapsedBreakTime = "00:00:00";
        this.elapsedDisplayTime = "00:00:00";
        this.resetTimer("working");
        this.workingTime = "00:00:00";
        this.working = null;
      }
    }
  }
  startBreakTime(init: boolean = true) {
    if (init || (this.break === void 0)) {
      if (init) {
        this.setTimer("breakStartTime");
      }
      // this.break = setInterval(this.breakTimer, 1000);
    }
    this.isBreak = true;
  }
  stopBreakTime(isAllReset: boolean = true) {
    // console.log("stopBreakTime");
    clearInterval(this.break);
    this.isBreak = false;
    this.saveElapsedBreak(this.breakTime);
    this.resetTimer("breakStartTime");
    this.breakTime = "00:00:00";
    if (!this.isDriving || this.isDriving === null) {
      // console.log("call startDrivingTime");
      this.startDrivingTime(false);
    }
  }
  resetStorage() {
    this.storage.keys()
      .then(
      (keys) => {
        this.storage.remove("DriveDate")
          .then(
          () => {
          }
          )
      },
      error => console.error("Error keys")
      );
  }

  saveElapsedBreak(addTime) {
    this.hms = addTime.split(':');
    var adds: number = Number(this.hms[0] * 60 * 60) + Number(this.hms[1] * 60) + Number(this.hms[2]);

    this.storage.get("elapsedBreak")
      .then(
      time => {
        if (time == null) {
          this.storage.set("elapsedBreak", adds);
        } else {
          this.storage.set("elapsedBreak", Number(time) + adds);
        }
      });
  }

  loadElapsedBreakTime(breakTime) {
    if (breakTime === void 0) {
      // breakTime = "00:00:00";
      this.elapsedBreakTime = "00:00:00";
      return;
    }
    this.storage.get("elapsedBreak")
      .then(
      time => {
        if (time == null) {
          this.hms = breakTime.split(':');
          this.secs = Number(this.hms[0]) * 60 * 60 + Number(this.hms[1]) * 60 + Number(this.hms[2]) + 1;
          this.hours = Math.floor(this.secs / (60 * 60));
          this.secs = this.secs - this.hours * 60 * 60;
          this.mins = Math.floor(this.secs / 60);
          this.secs = this.secs - this.mins * 60;
          this.elapsedBreakTime = ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
          // this.elapsedDisplayTime = this.elapsedBreakTime;
        } else {
          this.hms = breakTime.split(':');
          this.secs = Number(this.hms[0]) * 60 * 60 + Number(this.hms[1]) * 60 + Number(this.hms[2]) + 1 + Number(time);
          this.hours = Math.floor(this.secs / (60 * 60));
          this.secs = this.secs - this.hours * 60 * 60;
          this.mins = Math.floor(this.secs / 60);
          this.secs = this.secs - this.mins * 60;
          this.elapsedBreakTime = ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
          // if (this.elapsedBreakTime == "00:00:01" && this.workingTime == "00:00:00"){ // && breakTime == "00:00:00"){
          //   this.elapsedDisplayTime = "00:00:00";
          // } else {
            // this.elapsedDisplayTime = this.elapsedBreakTime;
          // }
        }
      });
  }

  setTimer(storageValue) {
    this.storage.set(storageValue, Date.now().toString())
      .then(
      () => {
      },
      error => {

      });
  }
  resetTimer(storageValue) {
    this.storage.remove(storageValue)
      .then(
      () => {
      },
      error => {
        console.error("Error: remove " + storageValue);
      });
  }
  updatePending(key = null) {
    if (key != null) {
      if (this.isUseZipCloud){
        this.http.get('http://zipcloud.ibsnet.co.jp/api/search?zipcode='+this.postalCode)
        .map((res) => {
          if (res.json().status == 200){
            this.shortAddress = res.json().results[0].address1 + res.json().results[0].address2 + res.json().results[0].address3;
            if (
              this.street.endsWith("丁目")
            ) {
              this.address = this.shortAddress + this.street + this.houseNumber;
            } else if (
              this.street.endsWith("通り")
              || this.street.endsWith("号線")
              || this.street.endsWith("街道")
            ) {
              this.address = this.shortAddress + "(" + this.street + ")";
            } else if (this.street == "Unnamed Road") {
              this.address = this.shortAddress;
            } else if (this.street == "") {
              this.address = this.shortAddress + this.houseNumber;
            } else {
              this.address = this.shortAddress + "(" + this.street + ")" + this.houseNumber;
            }
            if (key == "updateCurrentAddress"){
              return;
            }
            this.pending = this.pendingProvider.updatePending(this.pending, key, this.lat, this.lng, this.countryCode, this.postalCode, this.address, this.shortAddress);
            this.storage.set("pending", this.pending);
          } else {
            this.pending = this.pendingProvider.updatePending(this.pending, key, this.lat, this.lng, this.countryCode, this.postalCode, this.address, this.shortAddress);
            this.storage.set("pending", this.pending);
          }
        })
        .subscribe(data => {},
        err => console.log(err));
      } else {
        this.pending = this.pendingProvider.updatePending(this.pending, key, this.lat, this.lng, this.countryCode, this.postalCode, this.address, this.shortAddress);
        this.storage.set("pending", this.pending);
      }
    } else if (Object.keys(this.pending).length === 0) {
      this.pending = this.pendingProvider.initPending();
    }
    var isGetOutRequired: boolean = false;
    var virLen: number = this.pending["ViaData"].length;
    if (virLen > 0 && this.pending["GetOutDate"].length > 0) {
      var ViaDateTime = this.pending["ViaData"][virLen - 1]["date"] + this.pending["ViaData"][virLen - 1]["time"];
      var GetOutDateTime = this.pending["GetOutDate"] + this.pending["GetOutTime"];
      if (ViaDateTime > GetOutDateTime) {
        isGetOutRequired = true;
      }
    }
    if (this.pending["GetInDate"].length == 0) {
      this.isGetIn = true;
      this.isVia = this.isGetOut = this.isCancel = this.isRegist = false;
    } else if (isGetOutRequired) {
      this.pending["GetOutDate"] = this.pending["GetOutTime"] = "";
      this.isVia = this.isGetOut = this.isCancel = true;
      this.isGetIn = this.isRegist = false;
    } else if (this.pending["GetOutDate"].length > 0) {
      this.isVia = this.isCancel = this.isRegist = true;
      this.isGetIn = this.isGetOut = false;
    } else {
      this.isVia = this.isGetOut = this.isCancel = true;
      this.isGetIn = this.isRegist = false;
    }
  }

  async changeStrageValue(key, val) {
    await this.storage.set(key, val)
      .then(
      () => {
        console.log("Set " + val + " to " + key + ".");
        if (key == 'DriveDate') {
          this.getLog();
        }
      },
      error => console.log("Error")
      );
  }
  registPendingToDB() {
    this.db.insertLogger(this.driveDate, this.pending)
      .then(data => {
        // remove pending data from storage
        this.ready--;
        this.storage.remove("pending")
          .then(
          () => {
            this.pending = this.pendingProvider.initPending();
            this.updatePending();
            this.ready++;
            this.getLog();
          },
          error => {
            console.error("Can not remove pending data!!");
          }
          );
      })
      .catch(ex => {
        console.log(ex);
      });
  }
  removePendingData() {
    let alert = this.alertCtrl.create({
      title: '取消',
      message: '仕掛りデータを削除します。<br>よろしいですか？',
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
            this.ready--;
            this.storage.remove("pending")
              .then(
              () => {
                this.pending = this.pendingProvider.initPending();
                this.updatePending();
                this.ready++;
              },
              error => {
                console.error("Can not remove pending data!!");
              }
              )
          }
        }
      ]
    });
    alert.present();
  }
  getLog() {
    this.db.getLog(this.driveDate)
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
            }
          }
          this.hasHistory = true;
        }
      });
  }
  getLogs() {
    this.db.getLogs()
      .then(data => {
        if (data === undefined) {
          console.log("No Data");
        } else {
          console.log("data:::");
          console.log(data);
        }
      });
  }
  showDetail(event, date, number) {
    console.log("event:");
    console.log(event);
    console.log("date:" + date);
    console.log("number:" + number);
    this.navCtrl.push('DetailPage', { date: date, number: number });
  }
  reminderTrunkReverse() {
    this.isUsingTrunkRoom = !this.isUsingTrunkRoom;
    this.storage.set("isUsingTrunkRoom", this.isUsingTrunkRoom);
  }

  openUrl(url) {
    this.platform.ready().then(() => {
      this.browser = this.iab.create(url);
      this.browser.show();
    });
  }
  changeDriveDate() {
    var driveDate = this.driveDate.split("-");
    this.datePicker.show({
      date: new Date(driveDate[0],driveDate[1]-1,driveDate[2]),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      titleText: "乗務日\n(正しく設定してください。)",
      todayText: '今日'
    }).then(
      date => {
        this.driveDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).substr(-2) + "-" + ("0" + date.getDate()).substr(-2);
        this.changeStrageValue('DriveDate', this.driveDate);
      },
      err => console.log('Error occurred while getting date: ', err)
    );
  }
  changeTime(timeType){
    var driveDate = this.driveDate.split("-");
    var driveTime = this.CarUnloadingTime.split(":");
    var title = "出庫時刻\n(表示のみの備忘録です)";
    if (timeType == "CarReturnBoxTime"){
      driveTime = this.CarReturnBoxTime.split(":");
      title = "帰庫予定時刻\n(表示のみの目安です)";
    }
    var changeTime = new Date(driveDate[0],driveDate[1],driveDate[2], driveTime[0], driveTime[1]);

    this.datePicker.show({
      date: changeTime,
      mode: 'time',
      is24Hour: true,
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
      titleText: title
    }).then(
      date => {
        if (timeType == "CarUnloadingTime"){
          this.CarUnloadingTime = ("0" + date.getHours()).substr(-2) + ":" + ("0" + date.getMinutes()).substr(-2);
          this.changeStrageValue('CarUnloadingTime', this.CarUnloadingTime);
        } else {
          this.CarReturnBoxTime = ("0" + date.getHours()).substr(-2) + ":" + ("0" + date.getMinutes()).substr(-2);
          this.changeStrageValue('CarReturnBoxTime', this.CarReturnBoxTime);
        }
      },
      err => console.log('Error occurred while getting date: ', err)
    );
  }
}