import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';

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
  kms: number[] = new Array(1, 1.2, 1.5, 1.8, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300);

  dayFee: number;
  nightFee: number;
  adds: number;
  region: { [key: string]: any; } = {};
  regionName:string = "";
  pos: number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage,
    private http: Http,
  ) {
    this.storage.get("regSelected")
    .then(
    pos => {
      if (pos == null || pos == 0){
        // 未定義
        this.regionName = "";
        // console.log("return");
        return;
      }
      this.pos = pos;
      this.http.get('./assets/config/config.json')
      .map((res) => {
        this.region = res.json().region;
        // console.log(this.region[pos]);
        this.regionName = this.region[pos].name;
      })
      .subscribe();
    });
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad TinyCalcPage');
  }

  changeDistance(distance) {

    // 2017年1月30日からの計算式(東京２３区、武蔵野三鷹)
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
    this.dayFee = this.region[this.pos].dayFeeInit;
    if (distance > this.region[this.pos].dayDistanceInit) {
      this.adds = Math.ceil((distance - this.region[this.pos].dayDistanceInit) / this.region[this.pos].dayDistanceAdds);
      this.dayFee += this.adds * this.region[this.pos].dayFeeAdds;
      // 長距離割引
      if (this.dayFee > this.region[this.pos].dayFeeDiscountStart) {
        this.dayFee = this.region[this.pos].dayFeeDiscountStart + Math.ceil(((this.dayFee - this.region[this.pos].dayFeeDiscountStart) * this.region[this.pos].dayFeeDiscountRate) / this.region[this.pos].dayFeeAdds) * this.region[this.pos].dayFeeAdds;
      }
    }
    // 深夜料金
    this.nightFee = this.region[this.pos].nightFeeInit;
    if (distance > this.region[this.pos].nightDistanceInit) {
      this.adds = Math.ceil((distance - this.region[this.pos].nightDistanceInit) / this.region[this.pos].nightDistanceAdds);
      this.nightFee += this.adds * this.region[this.pos].nightFeeAdds;
      // 長距離割引
      if (this.nightFee > this.region[this.pos].nightFeeDiscountStart) {
        this.nightFee = this.region[this.pos].nightFeeDiscountStart + Math.ceil(((this.nightFee - this.region[this.pos].nightFeeDiscountStart) * this.region[this.pos].nightFeeDiscountRate) / this.region[this.pos].nightFeeAdds) * this.region[this.pos].nightFeeAdds;
      }
    }
  }
}