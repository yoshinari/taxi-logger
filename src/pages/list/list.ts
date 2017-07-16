import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';

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

  constructor(public navCtrl: NavController, private db: DbProvider) {
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
}
