import { Component, OnInit  } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private platform: Platform) {

  }

  ionViewDidLoad() {
    console.log("this.navigatorPlatform:");
    console.log(this.platform.navigatorPlatform()); // MacIntel / Win32 / Win16 ならば、dbの手法を変える
  }

  ngOnInit() {
  }

}
