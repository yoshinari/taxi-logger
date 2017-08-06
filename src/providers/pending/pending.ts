import { Injectable } from '@angular/core';
// import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the PendingProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class PendingProvider {

  pending: { [key: string]: any; } = {};
  date: string;
  time: string;

  constructor() {
    console.log('Hello PendingProvider Provider');
  }

  public loadPending(pending) {
    return pending;
  }
  public initPending() {
    this.pending["GetInDate"] = "";
    this.pending["GetInTime"] = "";
    this.pending["GetInLat"] = "";
    this.pending["GetInLng"] = "";
    this.pending["GetInCountryCode"] = "";
    this.pending["GetInPostalCode"] = "";
    this.pending["GetInAddress"] = "";
    this.pending["GetInShortAddress"] = "";
    this.pending["GetOutDate"] = "";
    this.pending["GetOutTime"] = "";
    this.pending["GetOutLat"] = "";
    this.pending["GetOutLng"] = "";
    this.pending["GetOutCountryCode"] = "";
    this.pending["GetOutPostalCode"] = "";
    this.pending["GetOutAddress"] = "";
    this.pending["GetOutShortAddress"] = "";
    this.pending["ViaData"] = [];
    this.pending["GetInMemo"] = "";
    this.pending["GetOutMemo"] = "";
    this.pending["ViaMemo"] = "";
    return this.pending;
  }
  public isPending(key: string = null) {
    return true;
  }
  public updatePending(pending, key, lat, lng, countryCode, postalCode, address, shortAddress) {
    var date = new Date();
    this.date = date.getFullYear() + '-'
      + ("0" + (date.getMonth() + 1)).substr(-2) + '-'
      + ("0" + date.getDate()).substr(-2);
    this.time = ("0" + date.getHours()).substr(-2)
      + ":" + ("0" + date.getMinutes()).substr(-2)
      + ":" + ("0" + date.getSeconds()).substr(-2);
    switch (key) {
      case 'GetIn':
        pending["GetInDate"] = this.date;
        pending["GetInTime"] = this.time;
        pending["GetInLat"] = lat;
        pending["GetInLng"] = lng;
        pending["GetInCountryCode"] = countryCode;
        pending["GetInPostalCode"] = postalCode;
        pending["GetInAddress"] = address;
        pending["GetInShortAddress"] = shortAddress;
        pending["GetInMemo"] = "";
        break;
      case 'GetOut':
        pending["GetOutDate"] = this.date;
        pending["GetOutTime"] = this.time;
        pending["GetOutLat"] = lat;
        pending["GetOutLng"] = lng;
        pending["GetOutCountryCode"] = countryCode;
        pending["GetOutPostalCode"] = postalCode;
        pending["GetOutAddress"] = address;
        pending["GetOutShortAddress"] = shortAddress;
        pending["GetOutMemo"] = "";
        break;
      case 'Via':
        pending["ViaData"].push({ date: this.date, time: this.time, lat: lat, lng: lng, country: countryCode, postal: postalCode, address: address, shortAddress: shortAddress, memo: "" });
    }
    console.log(pending);
    return pending;
  }

}
