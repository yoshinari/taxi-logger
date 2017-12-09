import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
// import 'rxjs/add/operator/map';

/**
 * Generated class for the SettingsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
// @Injectable()
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  isRemindUsingTrunkRoom: boolean = false;
  isUsingTrunkRoom: boolean = false;
  isShowAltitude: boolean = false;
  isUseZipCloud: boolean = false;
  region: { [key: string]: any; } = {};
  regionSelect = new Set()
  regSelected: number = 0;
  breakReset = {};
  breakSelect = new Set();
  brSelected: number = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private http: Http,
    private file: File,
    private fileChooser: FileChooser,
    public alertCtrl: AlertController,
  ) {
    this.storage.get("isRemindUsingTrunkRoom")
      .then(
      stat => {
        this.isRemindUsingTrunkRoom = stat;
      });
      // isUsingTrunkRoom
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
      // regSelected
      this.storage.get("regSelected")
      .then(
      stat => {
        if (stat !== null){
          this.regSelected = stat;
        }
      });
      this.storage.get("brSelected")
      .then(
      stat => {
        if (stat !== null){
          this.brSelected = stat;
        }
      });
      this.http.get('./assets/config/config.json')
      .map((res) => {
        this.regionSelect = new Set();
        for (var reg in res.json().region) {
          this.regionSelect.add(res.json().region[reg].name);
        }
        for (var br in res.json().breakReset) {
          this.breakSelect.add(res.json().breakReset[br]);
        }
      })
      .subscribe();
      // err => console.log(err));
    }

  updateUsingTrunkRoom() {
    this.storage.set("isRemindUsingTrunkRoom", this.isRemindUsingTrunkRoom);
  }
  helpRemindUsingTrunkRoom(){
    let alert = this.alertCtrl.create({
      title: 'トランク使用中のリマインダ',
      subTitle: "トランク使用時にこのボタンを押すことにより、ボタンが緑色になり、リマインドします。 \
      ボタンを再度押して灰色にしない限り、その乗務のログを登録できません。",
      buttons: ['OK']
    });
    alert.present();
    return;
  }
  updateShowAltitude(){
    this.storage.set("isShowAltitude", this.isShowAltitude);
  }
  helpAltitude(){
    let alert = this.alertCtrl.create({
      title: 'GPSの高度の表示',
      subTitle: "端末が対応していないと0mになります。",
      buttons: ['OK']
    });
    alert.present();
    return;
  }
  updateUsingZipCloud(){
    this.storage.set("isUseZipCloud", this.isUseZipCloud);
  }
  helpZipCloud(){
    let alert = this.alertCtrl.create({
      title: '郵便番号検索API',
      subTitle: "位置情報から住所を取得するNative Geocoderがイマイチのため、乗車、経由、降車の住所取得時に<a href='http://zipcloud.ibsnet.co.jp/doc/api'>郵便番号検索API</a>を利用します。",
      buttons: ['OK']
    });
    alert.present();
    return;
  }
  regOptionChange(reg) {
    this.storage.set("regSelected", reg);
    if (reg == 0){
      this.storage.set("regPCode", "^([0-9])");
      return;
    }
    this.http.get('./assets/config/config.json')
    .map((res) => {
      this.region = res.json().region;
      this.storage.set("regPCode", this.region[reg].pcode)
      .then(_ =>
      this.storage.get("regPCode")
      .then(
      stat => {
      }));
    })
    .subscribe();
  }
  helpRegOptionChange(){
    let alert = this.alertCtrl.create({
      title: '営業区域',
      subTitle: "営業区域を選択します。選択した営業区域の情報に基づき、営業区域外の判定や簡易料金計算の計算式を設定できます。 \
      <br><br>登録されていない区域の定義を募集しています。サンプルを元に、作成してお知らせください。<br><br> \
      <a href='https://github.com/yoshinari/taxi-logger/tree/master/src/assets/config/config.json'>現在の定義(コメント無し)</a> \
      <br><br><a href='https://github.com/yoshinari/taxi-logger/tree/master/src/assets/config/config.hjson'>サンプル(コメント付き)</a><br><br> \
      ※文字コード:UTF-8のjsonファイル形式で作成してください。",
      buttons: ['OK']
    });
    alert.present();
    return;
  }
  brOptionChange(br) {
    this.storage.set("brSelected", br);
    this.http.get('./assets/config/config.json')
    .map((res) => {
      this.breakReset = res.json().breakReset;
      this.storage.set("breakReset", this.breakReset[br]+":00")
      .then(_ =>
      this.storage.get("brSelected")
      .then(
      stat => {
      }));
    })
    .subscribe();
  }
  helpBrOptionChange(){
    let alert = this.alertCtrl.create({
      title: '連続走行時間のリセット',
      subTitle: "何分連続して休憩すると連続走行時間をリセットするかを選択します。",
      buttons: ['OK']
    });
    alert.present();
    return;
  }
  loadList(type) { // type: linklist / phonebook
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
      // console.log('uri:' + uri);
      // console.log(uri.substring(0, uri.lastIndexOf('/')));
      // console.log(uri.substring(uri.lastIndexOf('/') + 1));
      // directoryとファイル名に分割してreadAsTextで読み込む
      this.file.readAsText(uri.substring(0, uri.lastIndexOf('/')), uri.substring(uri.lastIndexOf('/') + 1))
        .then(stat => {
          var list = JSON.parse(stat);
          var i,j;
          for (i = 0; i < list.length; i++) {
            if (!list[i]["category"]||list[i]["category"]==""||!list[i]["category"]){
              let alert = this.alertCtrl.create({
                title: 'フォーマットが異なります',
                subTitle: (i+1)+'番目の定義にcategoryもしくはitemが記述されていません。',
                buttons: ['OK']
              });
              alert.present();
              return;
            }
            if (type == "linklist"){
              for (j = 0; j < list[i]["item"].length; j++) {
                if (!list[i]["item"][j]["title"]||!list[i]["item"][j]["url"]||list[i]["item"][j]["title"]==""||list[i]["item"][j]["url"]==""){
                  let alert = this.alertCtrl.create({
                    title: 'フォーマットが異なります',
                    subTitle: (i+1)+'番目の定義にtitleもしくはurlが記述されていません。',
                    buttons: ['OK']
                  });
                  alert.present();
                  return;
                }
              }
              this.storage.set("linklist", stat)
              .then(_ =>
                this.storage.get("linklist")
              .then(
              stat => {
              }));
            } else if (type == "phonebook"){
              for (j = 0; j < list[i]["item"].length; j++) {
                if (!list[i]["item"][j]["title"]||!list[i]["item"][j]["tel"]||list[i]["item"][j]["title"]==""||list[i]["item"][j]["tel"]==""){
                  let alert = this.alertCtrl.create({
                    title: 'フォーマットが異なります',
                    subTitle: (i+1)+'番目の定義にtitleもしくはtelが記述されていません。',
                    buttons: ['OK']
                  });
                  alert.present();
                  return;
                }
              }
              this.storage.set("phonebook", stat)
              .then(_ =>
                this.storage.get("phonebook")
              .then(
              stat => {
              }));
            } else if (type == "memo"){
              for (j = 0; j < list[i]["item"].length; j++) {
                if (!list[i]["item"][j]["title"]||!list[i]["item"][j]["desc"]||list[i]["item"][j]["title"]==""||list[i]["item"][j]["desc"]==""){
                  let alert = this.alertCtrl.create({
                    title: 'フォーマットが異なります',
                    subTitle: (i+1)+'番目の定義にtitleもしくはdescが記述されていません。',
                    buttons: ['OK']
                  });
                  alert.present();
                  return;
                }
              }
              this.storage.set("memo", stat)
              .then(_ =>
                this.storage.get("memo")
              .then(
              stat => {
              }));
            }
          }
        })
        .catch(err => {
          console.log(err);
          let alert = this.alertCtrl.create({
            title: 'エラー',
            subTitle: err.message,
            buttons: ['OK']
          });
          alert.present();
          return;
        })
    })
    .catch(err => {
      console.log(err);
      let alert = this.alertCtrl.create({
        title: 'エラー',
        subTitle: err.message,
        buttons: ['OK']
      });
      alert.present();
      return;
    });
  }
  helpLoadList(type){
    if (type == "linklist"){
      let alert = this.alertCtrl.create({
        title: 'リンクリスト',
        subTitle: "リンクリストの定義ファイルを取り込みます。<br><br><a href='https://github.com/yoshinari/taxi-logger/blob/master/sample_linklist.json'>サンプル</a><br><br> ※文字コード:UTF-8のjsonファイル形式で作成してください。",
        buttons: ['OK']
      });
      alert.present();
    } else if (type == "phonebook"){
      let alert = this.alertCtrl.create({
        title: '電話帳',
        subTitle: "電話帳の定義ファイルを取り込みます。<br><br><a href='https://github.com/yoshinari/taxi-logger/blob/master/sample_phonebook.json'>サンプル</a><br><br> ※文字コード:UTF-8のjsonファイル形式で作成してください。",
        buttons: ['OK']
      });
      alert.present();
    } else if (type == "memo"){
      let alert = this.alertCtrl.create({
        title: 'メモ',
        subTitle: "メモの定義ファイルを取り込みます。<br><br><a href='https://github.com/yoshinari/taxi-logger/blob/master/sample_memo.json'>サンプル</a><br><br> ※文字コード:UTF-8のjsonファイル形式で作成してください。",
        buttons: ['OK']
      });
      alert.present();
    }
    return;
  }
}
