import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import MyTimer from "./timer";
var myTimer: MyTimer = new MyTimer();

import MyPending from "./pending";
var myPending: MyPending = new MyPending();
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

  driveDate: any; // Date and String
  month: any; // Number and String
  day: any; // Number and String
  CarUnloadingTime: string; // 出庫 Car unloading
  CarReturnBoxTime: string; // 帰庫 Car return box

  clock: { [key: string]: string } = {};

  drivingTime: string;
  driving: number;

  isDriving: boolean = false;

  breakTime: string;
  break: number;

  isBreak: boolean = false;

  elapsedBreakTime: string;


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

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private storage: Storage) {
  }
  underConstuctionAlert() {
    let alert = this.alertCtrl.create({
      title: '未実装!',
      subTitle: 'この機能はまだ実装されていません',
      buttons: ['OK']
    });
    alert.present();
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
    console.log('ionViewDidLoad LoggerPage');
    // this.resetStorage();


    // 日付がストレージに保存されていない場合、今日の日付を設定する
    this.storage.get("DriveDate")
      .then(
      date => {
        // console.log("get drive date from strage:" + date);
        if (date === null) {
          // console.log("date is null;");
          this.driveDate = new Date();
          this.driveDate = this.driveDate.getFullYear() + '-'
            + ("0" + (this.driveDate.getMonth() + 1)).substr(-2) + '-'
            + ("0" + this.driveDate.getDate()).substr(-2);
          this.changeStrageValue("DriveDate", this.driveDate);
        } else {
          this.driveDate = date;
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );

    // 出庫時間がストレージに保存されていない場合、初期値を設定する
    this.storage.get("CarUnloadingTime")
      .then(
      time => {
        if (time === null) {
          console.log("time is null;");
          this.CarUnloadingTime = '07:00';
          this.changeStrageValue("CarUnloadingTime", this.CarUnloadingTime);
        } else {
          this.CarUnloadingTime = time;
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );

    // 帰庫時間がストレージに保存されていない場合、初期値を設定する
    this.storage.get("CarReturnBoxTime")
      .then(
      time => {
        if (time === null) {
          console.log("time is null;");
          this.CarReturnBoxTime = '03:00';
          this.changeStrageValue("CarReturnBoxTime", this.CarReturnBoxTime);
        } else {
          this.CarReturnBoxTime = time;
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );

    // isDrivingの設定
    this.loadTimer("drivingTime", "drivingStartTime");
    this.loadTimer("breakTime", "breakStartTime");

    // 仕掛中データの取得

    console.log("仕掛中データの取得");
    this.storage.get("pending")
      .then(
      pending => {
        if (pending === null) {
          this.pending = myPending.initPending();
        } else {
          myPending.loadPending(pending);
          this.pending = pending;
        }
        this.updatePending();
        this.ready++;
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );

  }

  // 時計
  timerId = setInterval(() => {
    this.clock = myTimer.showClock();
  }, 1000);

  // 運転時間
  drivingTimer = () => {
    this.loadTimer("drivingTime", "drivingStartTime");
  };
  startDrivingTime(init: boolean = true) {
    if (init || (this.driving === void 0)) {
      if (init) {
        this.setTimer("drivingStartTime");
      }
      this.driving = setInterval(this.drivingTimer, 1000);
    }
    this.isDriving = true;
  }
  stopDrivingTime(isAllReset: boolean = true) {
    clearInterval(this.driving);
    this.isDriving = false;
    this.resetTimer("drivingStartTime");
    this.drivingTime = "00:00:00"
    if (isAllReset) {
      this.resetTimer("elapsedBreak");
      this.elapsedBreakTime = "00:00:00";
    }
  }
  // 休憩時間
  breakTimer = () => {
    this.loadTimer("breakTime", "breakStartTime");
    // 総休憩時間をセットする
    this.loadElapsedBreakTime(this.breakTime);
    if (this.breakTime) {
      var hms = this.breakTime.split(':');
      if (Number(hms[1]) >= 15 && this.isDriving) { // 15分以上連続して休憩したら、連続走行時間をリセットする。
        this.stopDrivingTime(false);
      }
    }
  };
  startBreakTime(init: boolean = true) {
    if (init || (this.break === void 0)) {
      if (init) {
        this.setTimer("breakStartTime");
      }
      this.break = setInterval(this.breakTimer, 1000);
    }
    this.isBreak = true;
  }
  stopBreakTime(isAllReset: boolean = true) {
    clearInterval(this.break);
    this.isBreak = false;
    this.saveElapsedBreak(this.breakTime);
    this.resetTimer("breakStartTime");
    this.breakTime = "00:00:00";
    if (!this.isDriving) {
      this.startDrivingTime();
    }
  }
  changeStrageValue(key, val) {
    this.storage.set(key, val)
      .then(
      () => console.log("Set " + val + " to " + key + "."),
      error => console.log("Error")
      )
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

  private loadTimer(type, storageValue) {
    this.storage.get(storageValue)
      .then(
      time => {
        if (time == null) {
          this.timeString = "00:00:00";
        } else {
          this.old = Number(time);
          this.secs = Number(Date.now().toString()) - this.old;
          this.hours = 0;
          this.mins = 0;
          this.secs = Math.floor(this.secs / 1000);
          this.hours = Math.floor(this.secs / (60 * 60));
          this.secs = this.secs - this.hours * 60 * 60;
          this.mins = Math.floor(this.secs / 60);
          this.secs = this.secs - this.mins * 60;
          this.timeString = ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
          if (type == "drivingTime") {
            this.drivingTime = this.timeString;
            if (this.drivingTime && this.drivingTime != "00:00:00" && !this.isDriving) {
              //   // 運転中なので、タイマーを動かす
              this.startDrivingTime(false);
            }
          } else if (type == "breakTime") {
            this.breakTime = this.timeString;
            if (this.breakTime && this.breakTime != "00:00:00") {
              //   // 運転中なので、タイマーを動かす
              this.startBreakTime(false);
            }
          }
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
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
      breakTime = "00:00:00";
    }
    this.storage.get("elapsedBreak")
      .then(
      time => {
        if (time == null) {
          this.elapsedBreakTime = breakTime;
        } else {
          this.hms = breakTime.split(':');
          this.secs = Number(this.hms[0]) * 60 * 60 + Number(this.hms[1]) * 60 + Number(this.hms[2]) + Number(time);
          this.hours = 0;
          this.mins = 0;
          this.hours = Math.floor(this.secs / (60 * 60));
          this.secs = this.secs - this.hours * 60 * 60;
          this.mins = Math.floor(this.secs / 60);
          this.secs = this.secs - this.mins * 60;
          this.elapsedBreakTime = ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
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
      this.pending = myPending.updatePending(this.pending, key);
      this.storage.set("pending", this.pending);
    } else if (Object.keys(this.pending).length === 0) {
      this.pending = myPending.initPending();
    }
    var isGetOutRequired:boolean=false;
    var virLen:number = this.pending["ViaData"].length;
    if (virLen>0 && this.pending["GetOutDate"].length>0){
      var ViaDateTime = this.pending["ViaData"][virLen-1]["date"] + this.pending["ViaData"][virLen-1]["time"];
      var GetOutDateTime = this.pending["GetOutDate"] + this.pending["GetOutTime"];
      if (ViaDateTime>GetOutDateTime){
        isGetOutRequired=true;
      }
    }
    if (this.pending["GetInDate"].length == 0) {
      this.isGetIn = true;
      this.isVia = this.isGetOut = this.isCancel = this.isRegist = false;
    } else if (isGetOutRequired){
      this.pending["GetOutDate"]=this.pending["GetOutTime"]="";
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
  registPendingToDB() {
    let alert = this.alertCtrl.create({
      title: 'ごめんなさい',
      message: '作成中のため、仕掛りデータを削除します。<br>データベースには登録しません。<br>よろしいですか？',
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
                this.pending = myPending.initPending();
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
                this.pending = myPending.initPending();
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
}