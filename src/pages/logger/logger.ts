import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import MyTimer from "./timer";

var myTimer: MyTimer = new MyTimer();
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

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController) {
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
    // 日付がストレージに保存されていない場合、今日の日付を設定する
    if (localStorage.driveDate) {
      // console.log('localStorage.driveDate:' + localStorage.driveDate);
      this.driveDate = localStorage.driveDate;
    } else {
      // console.log('no local storage');
      this.driveDate = new Date();
      this.month = this.driveDate.getMonth() + 1;
      if (this.month < 10) {
        this.month = '0' + this.month;
      }
      this.day = this.driveDate.getDate();
      if (this.day < 10) {
        this.day = '0' + this.day;
      }
      this.driveDate = this.driveDate.getFullYear() + '-' + this.month + '-' + this.day;
      // console.log("driveDate: " + this.driveDate);
    }
    if (localStorage.CarUnloadingTime) {
      this.CarUnloadingTime = localStorage.CarUnloadingTime;
    } else {
      this.CarUnloadingTime = '07:00';
    }
    if (localStorage.CarReturnBoxTime) {
      this.CarReturnBoxTime = localStorage.CarReturnBoxTime;
    } else {
      this.CarReturnBoxTime = '03:00';
    }
    this.drivingTime = myTimer.loadTimer("drivingStartTime");
    if (this.drivingTime != "00:00:00") {
      // 運転中なので、タイマーを動かす
      this.startDrivingTime();
    } else {
      this.isBreak = false;
    }
    this.breakTime = myTimer.loadTimer("breakStartTime");
    if (this.breakTime != "00:00:00") {
      // 休憩中なので、タイマーを動かす
      this.startBreakTime();
    } else {
      this.isBreak = false;
    }

    // 総休憩時間をセットする
    this.elapsedBreakTime = myTimer.loadElapsedBreakTime(this.breakTime);
  }

  // 時計
  timerId = setInterval(() => {
    this.clock = myTimer.showClock();
  }, 1000);

  // 運転時間
  drivingTimer = () => {
    this.drivingTime = myTimer.loadTimer("drivingStartTime");
  };
  startDrivingTime() {
    myTimer.setTimer("drivingStartTime");
    this.driving = setInterval(this.drivingTimer, 1000);
    console.log('this.driving(start):' + this.driving);
    this.isDriving = true;
  }
  stopDrivingTime(isAllReset: boolean = true) {
    // console.log('Stop Driving Time');
    console.log('this.driving(stop):' + this.driving);
    clearInterval(this.driving);
    this.isDriving = false;
    myTimer.resetTimer("drivingStartTime");
    this.drivingTime = "00:00:00"
    if (isAllReset) {
      myTimer.resetTimer("elapsedBreak");
    this.elapsedBreakTime = "00:00:00";
    }
  }
  // 休憩時間
  breakTimer = () => {
    this.breakTime = myTimer.loadTimer("breakStartTime");
    // 総休憩時間をセットする
    this.elapsedBreakTime = myTimer.loadElapsedBreakTime(this.breakTime);
    // 15分以上休憩したら、(連続)運転時間をリセットする
    var hms: string[] = this.breakTime.split(':');
    if (Number(hms[1]) >= 15 && this.isDriving) { // 15分以上連続して休憩したら、連続走行時間をリセットする。
      console.log("timer reset!!");
      this.stopDrivingTime(false);
    }
  };
  startBreakTime() {
    myTimer.setTimer("breakStartTime");
    this.break = setInterval(this.breakTimer, 1000);
    console.log('this.break(start):' + this.break);
    this.isBreak = true;
  }
  stopBreakTime(isAllReset: boolean = true) {
    // console.log('Stop Driving Time');
    console.log('this.break(stop):' + this.break);
    clearInterval(this.break);
    this.isBreak = false;
    myTimer.saveElapsedBreak(this.breakTime);
    myTimer.resetTimer("breakStartTime");
    this.breakTime = "00:00:00";
    if (!this.isDriving){
      this.startDrivingTime();
    }
  }
  // 総休憩時間
  // 休憩終了時にlocalStorageに前回の休憩までの時間を保存する。 > hh*60*60+mm*60+ss
  // breakTimerで前回までの休憩時間と今の休憩時間を合算する。
  // 運転時間をボタンを押して止めるときに、localStorageを削除する。
}
