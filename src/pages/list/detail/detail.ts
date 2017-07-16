import { Component } from '@angular/core';
import { AlertController, NavController, IonicPage, NavParams } from 'ionic-angular';
import { DbProvider } from '../../../providers/db/db';
import { HistoryPage } from '../history/history';

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

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private db: DbProvider,
  ) {
    this.date = navParams.get('date');
    this.number = navParams.get('number');
    this.rootPage = HistoryPage;
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
    this.navCtrl.push('UpdatePage', { date:date, number:number });
  }
}
