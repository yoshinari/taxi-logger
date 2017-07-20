import { Component, OnInit  } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  browser:any;
  constructor(
    public navCtrl: NavController,
    private iab: InAppBrowser, 
    private platform: Platform
  ) {

  }

  ionViewDidLoad() {
    console.log("this.navigatorPlatform:");
    console.log(this.platform.navigatorPlatform()); // MacIntel / Win32 / Win16 ならば、dbの手法を変える
  }

  ngOnInit() {
  }

  openUrl(url){
    this.platform.ready().then(() => {
      this.browser = this.iab.create(url);
      this.browser.show();
    });
  }
}
