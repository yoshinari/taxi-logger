import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TinyCalcPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-tiny-calc',
  templateUrl: 'tiny-calc.html',
})
export class TinyCalcPage {
  kms: number[] = new Array(1, 1.2, 1.5, 1.8, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300);

  dayFee: number;
  nightFee: number;
  adds: number;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TinyCalcPage');
  }

  changeDistance(distance) {

    // 2017年1月30日からの計算式
    // 距離制運賃

    // 通常料金
    // 初乗運賃 1.059km 410円
    // 加算運賃 237mごと 80円

    // 深夜料金
    // 0.8472kmまで初乗り410円
    // 0.1896kmごとに加算料金80円
    //
    // 9000円を超える金額は一割引
    //
    // 時間距離併用制 1分30秒 80円

    // 通常料金
    this.dayFee = 410;
    if (distance > 1.059) {
      this.adds = Math.ceil((distance - 1.059) / 0.237);
      this.dayFee += this.adds * 80;
      // 長距離割引
      if (this.dayFee > 9000) {
        this.dayFee = 9000 + Math.ceil(((this.dayFee - 9000) * 0.9) / 90) * 90;
      }
    }
    // 深夜料金
    this.nightFee = 410;
    if (distance > (1.059 * 0.8)) {
      this.adds = Math.ceil((distance - 0.8472) / 0.1896);
      this.nightFee += this.adds * 80;
      // 長距離割引
      if (this.nightFee > 9000) {
        this.nightFee = 9000 + Math.ceil(((this.nightFee - 9000) * 0.9) / 80) * 80;
      }
    }
  }
}