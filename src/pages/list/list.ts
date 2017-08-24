import { Component } from '@angular/core';
import { AlertController, NavController, IonicPage } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';

@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  rootPage: any;
  items: Array<{ title: string, page: any }>;
  Logs = new Set();
  hasLog: boolean;
  date: string;
  isImporting: boolean = false;

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    private db: DbProvider,
    private file: File,
    private fileChooser: FileChooser,
  ) {
    this.rootPage = ListPage;

    this.items = [
      {
        title: 'History',
        page: 'HistoryPage'
      },
    ]
  }
  ionViewDidLoad() {
    console.log("list.ts: ionViewDidLoad()");
  }
  ionViewWillEnter() {
    console.log("list.ts: ionViewWillEnter()");
    this.db.getLogs()
      .then(data => {
        if (data === undefined) {
          console.log("No Data");
          this.hasLog = false;
        } else {
          this.Logs = new Set();
          console.log("data:::");
          console.log(data);
          for (var i = 0; i < data.length; i++) {
            this.Logs.add(data[i]);
          }
          this.hasLog = true;
        }
      });
  }
  ionViewDidEnter() {
    console.log("list.ts: ionViewDidEnter()");
  }
  ionViewWillLeave() {
    console.log("list.ts: ionViewWillLeave");
  }
  ionViewDidLeave() {
    console.log("list.ts: ionViewDidLeave()");
  }
  ionViewWillUnload() {
    console.log("list.ts: ionViewWillUnload()");
  }
  ionViewCanEnter() {
    console.log("list.ts: ionViewCanEnter()");
  }
  ionViewCanLeave() {
    console.log("list.ts: ionViewCanLeave()");
  }

  itemTapped(event, item, date) {
    this.navCtrl.push(item.page, { date: date });
  }

  importHistoryData() {
    console.log('importHistoryData');
    this.isImporting = true;
    this.fileChooser.open()
      .then(uri => {
        console.log(uri);
        // uriがjsonで終わらなければ対象外ファイルで終了
        // uriがfile:///で始まらない場合、/file/があれば、そこをfile:///に置き換える
        if (uri.startsWith('file:///')) {
          // OK 簡単
        } else if (uri.indexOf('/file/')) {
          uri = 'file:///' + uri.substring(uri.indexOf('/file/') + 6);
        } else {
          alert('このアプリケーションはサポートしていません。Yahoo File Manager等を使ってください。');
          return;
        }
        console.log('uri:' + uri);
        console.log(uri.substring(0, uri.lastIndexOf('/')));
        console.log(uri.substring(uri.lastIndexOf('/') + 1));
        // directoryとファイル名に分割してreadAsTextで読み込む
        this.file.readAsText(uri.substring(0, uri.lastIndexOf('/')), uri.substring(uri.lastIndexOf('/') + 1))
          .then(stat => {
            console.log(stat);
            console.log(JSON.parse(stat));
            // jsonファイルの形式が正しく、その日のデータがdbに無ければ、dbに入れる
            var history = JSON.parse(stat);
            console.log('history.length:' + history.length);
            for (var i = 0; i < history.length; i++) {
              if (history[i]['Number'] !== (i + 1)) {
                console.log('JSON format error!');
                // alert error message
                let alert = this.alertCtrl.create({
                  title: 'フォーマットが異なります',
                  subTitle: '指定されたファイルはTaxi-Loggerの正しい履歴ファイルではありません。',
                  buttons: ['OK']
                });
                alert.present();
                return;
              }
            }
            this.date = history[0]['Date'];
            this.db.getLog(this.date)
              .then(data => {
                if (data === undefined) {
                  // データをDBに取り込む
                  var finish: number = 0;
                  for (var i = 0; i < history.length; i++) {
                    this.db.importLogger(history[i])
                      .then(stat => {
                        console.log(stat);
                        finish++;
                        console.log(finish);
                        if (finish == history.length) {
                          //ページの状態を戻すためのトリック
                          this.navCtrl.push('HistoryPage')
                            .then(_ => {
                              this.navCtrl.pop();
                            });
                          let alert = this.alertCtrl.create({
                            title: '読み込み完了',
                            subTitle: this.date + 'の履歴ファイルを読み込みました。',
                            buttons: ['OK']
                          });
                          alert.present();
                          this.hasLog = false;
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        if (i == history.length) {
                          this.hasLog = false;
                        }
                      });
                  }
                } else {
                  // alert 既にデータが有るのでインポート出来ません。
                  let alert = this.alertCtrl.create({
                    title: '既にデータがあります',
                    subTitle: this.date + 'の履歴データが既に存在します。置き換える場合は、先にデータベースの履歴データを削除してください。',
                    buttons: ['OK']
                  });
                  alert.present();
                  this.hasLog = true;
                }
              });

            this.isImporting = false;
          })
          .catch(err => {
            console.log(err);
            this.isImporting = false;
          })
      })
      .catch(err => {
        console.log(err);
        this.isImporting = false;
      });
    this.isImporting = false;
  }
}
