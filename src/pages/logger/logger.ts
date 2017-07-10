import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { TimerProvider } from '../../providers/timer/timer';
import { PendingProvider } from '../../providers/pending/pending';
import { DbProvider } from '../../providers/db/db';

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
  logData: { [key: string]: string } = {};

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

  history = new Set();
  hasHistory: boolean = false;
  viaHistory = new Set();

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private storage: Storage, private timerProvider: TimerProvider, private pendingProvider: PendingProvider, public db: DbProvider) {
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
  }

  // 時計
  timerId = setInterval(() => {
    this.clock = this.timerProvider.showClock();
  }, 1000);

  // 運転時間
  drivingTimer = () => {
    this.timerProvider.loadTimer("drivingTime", "drivingStartTime")
      .then(
      time => {
        this.drivingTime = time;
      },
      error => {

      });;
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
    this.timerProvider.loadTimer("breakTime", "breakStartTime")
      .then(
      time => {
        this.breakTime = time;
      },
      error => {

      });;
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
      this.pending = this.pendingProvider.updatePending(this.pending, key);
      this.storage.set("pending", this.pending);
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
            if (data[i]["ViaData"]){
              var obj = JSON.parse(data[i]["ViaData"]);
              if (obj.length > 0){
                for (var j = 0; j < obj.length; j++){
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
}