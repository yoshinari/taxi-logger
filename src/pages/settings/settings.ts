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
        // res.json();
        // console.log(res.json());
        // this.region = res.json().region;
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


  ionViewDidLoad() {
    // console.log('ionViewDidLoad SettingsPage');
  }
  updateUsingTrunkRoom() {
    // console.log('updateUsingTrunkRoom:');
    // console.log('isRemindUsingTrunkRoom:' + this.isRemindUsingTrunkRoom);
    this.storage.set("isRemindUsingTrunkRoom", this.isRemindUsingTrunkRoom);
  }
  updateShowAltitude(){
    this.storage.set("isShowAltitude", this.isShowAltitude);
  }
  // "isUseZipCloud" (ionChange)="updateUsingZipCloud()"
  updateUsingZipCloud(){
    this.storage.set("isUseZipCloud", this.isUseZipCloud);
    console.log("isUseZipCloud:"+this.isUseZipCloud);
  }
  regOptionChange(reg) {
    // console.log(reg);
    this.storage.set("regSelected", reg);
    if (reg == 0){
      this.storage.set("regPCode", "^([0-9])");
      return;
    }

    this.http.get('./assets/config/config.json')
    .map((res) => {
      this.region = res.json().region;
      // console.log(this.region[reg].pcode);
      this.storage.set("regPCode", this.region[reg].pcode)
      .then(_ =>
      this.storage.get("regPCode")
      .then(
      stat => {
        // console.log("regPCode:"+stat);
      }));
    })
    .subscribe();

    var pcode = "123-4567";
    var regexp = new RegExp('');
    var test = regexp.test(pcode);
    // console.log(test);
    pcode = "112-1453";
    test = regexp.test(pcode);
    // console.log(test);
  }
  brOptionChange(br) {
    // console.log("br:"+br);
    this.storage.set("brSelected", br);
    this.http.get('./assets/config/config.json')
    .map((res) => {
      this.breakReset = res.json().breakReset;
      // console.log(this.region[reg].pcode);
      this.storage.set("breakReset", this.breakReset[br]+":00")
      .then(_ =>
      this.storage.get("brSelected")
      .then(
      stat => {
        // console.log("brSelected:"+stat);
      }));
    })
    .subscribe();
  }
  loadUrlList() {

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
          // console.log(stat);
          // console.log(JSON.parse(stat));
          var linklist = JSON.parse(stat);
          // console.log('linklist.length:' + linklist.length);
          for (var i = 0; i < linklist.length; i++) {
            if (!linklist[i]["title"]||!linklist[i]["url"]||linklist[i]["title"]==""||linklist[i]["url"]==""){
              // console.log('JSON format error ... title');
                // alert error message
                let alert = this.alertCtrl.create({
                  title: 'フォーマットが異なります',
                  subTitle: (i+1)+'番目の定義にtitleもしくはurlが記述されていません。',
                  buttons: ['OK']
                });
                alert.present();
                return;
            }
            this.storage.set("linklist", stat)
            .then(_ =>
              this.storage.get("linklist")
            .then(
            stat => {
              // console.log("linklist:");
              // console.log(stat);
            }));
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
    });
  }
}
