import { Component } from '@angular/core';
import { AlertController, NavController, IonicPage, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { DbProvider } from '../../../providers/db/db';
import { ListPage } from '../../list/list';
import { File } from '@ionic-native/file';
@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {

  rootPage: any;
  date: string;

  history = new Set();
  hasHistory: boolean = false;
  viaHistory = new Set();
  errorMSG: string;

  isExporting: boolean = false;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private db: DbProvider,
    private file: File,
  ) {
    this.date = navParams.get('date');
    this.rootPage = ListPage;

    // this.navCtrl.goToRoot({})
    // .then(data => {
    //   console.log("goto root");
    // })
    // .catch(error => {
    //   console.log(error);
    // });



  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter HistoryPage');
    this.db.getLog(this.date, "asc")
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
          console.log("history:");
          console.log(this.history);
          console.log("ViaData");
          console.log(this.viaHistory);
        }
      });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HistoryPage');
  }
  ionViewWillLeave() {
    console.log("Looks like I'm about to leave");
    // this.navCtrl.pop();
  }
  exportHistoryData() {
    console.log('exportHistoryData');
    this.isExporting = true; 
    this.db.getLog(this.date, "asc")
      .then(data => {
        if (data === undefined) {
          this.hasHistory = false;
        } else {
          this.hasHistory = true;
          this.file.checkDir(this.file.externalRootDirectory, 'tokyo.itaxi.taxiLogger.history')
            .then(_ => {
              this.file.writeFile(this.file.externalRootDirectory + 'tokyo.itaxi.taxiLogger.history', this.date + '.json', JSON.stringify(data), { replace: true })
                .then(stat => {
                  console.log('Write OK!!');
                  console.log(stat);
                  console.log(stat['fullPath']);  // /tokyo.itaxi.taxiLogger.history/2017-07-12.json
                  let alert = this.alertCtrl.create({
                    title: '以下に履歴ファイルを出力しました',
                    subTitle: stat['fullPath'],
                    buttons: ['OK']
                  });
                  alert.present();
                  this.isExporting = false;
                  return;
                })
                .catch(err => {
                  console.log('Write NG!!');
                  console.log(err);
                  this.isExporting = false;
                  return;
                });
            })
            .catch(err => {
              this.file.createDir(this.file.externalRootDirectory, 'tokyo.itaxi.taxiLogger.history', false)
                .then(_ => {
                  console.log('Successfuly create directory: ' + this.file.externalRootDirectory + 'tokyo.itaxi.taxiLogger.history');
                  this.file.writeFile(this.file.externalRootDirectory + 'tokyo.itaxi.taxiLogger.history', this.date + '.json', JSON.stringify(data), { replace: true })
                    .then(stat => {
                      console.log('Write OK!!');
                      console.log(stat);
                      console.log(stat['fullPath']);
                      this.isExporting = false;
                      return;
                    })
                    .catch(err => {
                      console.log('Write NG!!');
                      console.log(err);
                      this.isExporting = false;
                      return;
                    });
                })
                .catch(err => {
                  console.log('Error:');
                  console.log(err);
                  this.isExporting = false;
                });
            })
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
                const toast = this.toastCtrl.create({
                  message: this.date + 'の乗務履歴を削除しました',
                  showCloseButton: true,
                  position: 'middle',
                  closeButtonText: 'Ok'
                });
                toast.present();
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
    // this.navCtrl.pop();
    // this.navCtrl.goToRoot({})
    // .then(xx => {

    // })
    // .catch(error => {
    //   console.log(error);
    // });
    this.navCtrl.remove(1);
  }
  showDetail(event, date, number) {
    console.log("event:");
    console.log(event);
    console.log("date:" + date);
    console.log("number:" + number);
    this.navCtrl.push('DetailPage', { date: date, number: number });
  }
}

