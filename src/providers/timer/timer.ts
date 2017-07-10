import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
// import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the TimerProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class TimerProvider {

  clock: { [key: string]: string } = {};
  timer: Date;
  timeString: string;

  old: number;
  now: Date;
  hours: number;
  mins: number;
  secs: number;

  hms: number[];

  status: boolean;

  constructor(private storage: Storage) {
    console.log('Hello TimerProvider Provider');
  }
  public showClock() {
    this.timer = new Date();
    // 平成しか考えていない。何故って次は未定だから。
    this.clock["gengou"] = this.timer.getFullYear() + "年" + (this.timer.getMonth() + 1) + "月" + this.timer.getDate() + "日 (平成" + (this.timer.getFullYear() - 1988) + "年)";
    this.clock["clock"] = ("0" + this.timer.getHours()).substr(-2) + ":" + ("0" + this.timer.getMinutes()).substr(-2) + ":" + ("0" + this.timer.getSeconds()).substr(-2);
    return this.clock;
  }

  // 日付がストレージに保存されていない場合、今日の日付を設定する
  async getDriveDate(returnDate) {
    await this.storage.get("DriveDate")
      .then(
      date => {
        // console.log("get drive date from strage:" + date);
        if (date === null) {
          // console.log("date is null;");
          returnDate = new Date();
          returnDate = returnDate.getFullYear() + '-'
            + ("0" + (returnDate.getMonth() + 1)).substr(-2) + '-'
            + ("0" + returnDate.getDate()).substr(-2);
          this.changeStrageValue("DriveDate", returnDate); // Promissをクリティカルに処理する必要は無い
          console.log("DriveDate=====>" + returnDate);
        } else {
          returnDate = date;
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );
    return returnDate;
  }

  // 出庫時間がストレージに保存されていない場合、初期値を設定する
  async getTime(timeName, returnTime) {  // TimeName, DefaultValue
    await this.storage.get(timeName)
      .then(
      time => {
        if (time === null) {
          console.log("time is null;");
          this.changeStrageValue(timeName, returnTime);
        } else {
          returnTime = time;
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );
    return returnTime;
  }

  async loadTimer(type, storageValue) {
    await this.storage.get(storageValue)
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
        }
      },
      error => {
        console.error("ERROR KEY DOES NOT EXIST");
      }
      );
    return this.timeString;
  }

  async changeStrageValue(key, val) {
    await this.storage.set(key, val)
      .then(
      () => console.log("Set " + val + " to " + key + "."),
      error => console.log("Error")
      );
  }

  async getStatus(key) {
    await this.storage.get(key)
      .then(
      status => {
        if (status == null) {
          console.log("Null: return " + key + " as false.");
          this.status = false;
        } else if (status == true) {
          console.log("return " + key + " as true.");
          this.status = true;
        }
      }
      );
    return this.status;
  }

  async setStatus(key, val) {
    await this.storage.set(key, val)
      .then(
      () => console.log("set"),
      error => console.log("Error"),
    );
  }
}
