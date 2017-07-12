import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
// import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

/*
  Generated class for the DbProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/

//
// 以下のURLを元に作成。不明点多し。完全手抜きコード。まるっと差し替えるかもしれない。
//
// https://stackoverflow.com/questions/43548793/sqliteobject-is-undefined-in-ionic-3
// https://forum.ionicframework.com/t/ionic-native-sqlite-issue/87416
//
const DB_NAME: string = 'TaxiLogger';
const win: any = window;

@Injectable()
export class DbProvider {
  private _dbPromise: Promise<any>;

  number: number=0;

  constructor(public platform: Platform) {
    this._dbPromise = new Promise((resolve, reject) => {
      try {
        let _db: any;
        this.platform.ready().then(() => {
          if (this.platform.is('cordova') && win.sqlitePlugin) {
            console.warn('FOR MOBILE DEVICE');
            //FOR MOBILE DEVICE
            _db = win.sqlitePlugin.openDatabase({
              name: DB_NAME,
              location: 'default'
            });
          } else {
            console.warn('FOR WEBSQL');
            //FOR WEBSQL
            console.warn('Storage: SQLite plugin not installed, falling back to WebSQL. Make sure to install cordova-sqlite-storage in production!');
            _db = win.openDatabase(DB_NAME, '1.0', 'database', 5 * 1024 * 1024);
          }
          resolve(_db);
        });
      } catch (err) {
        reject({ err: err });
      }
    });
    this._tryInit();
  }

  // Initialize the DB with our required tables
  _tryInit() {
    // this.query('DROP TABLE IF EXISTS Logger').catch(err => {
    //   console.error('Storage: Unable to drop Logger table', err.tx, err.err);
    // });
    this.query(`CREATE TABLE IF NOT EXISTS Logger (
                         Date TEXT NOT NULL,
                         Number INTEGER NOT NULL,
                         GetInDate TEXT NOT NULL,
                         GetInTime TEXT NOT NULL,
                         GetInLat INTEGER,
                         GetInLng INTEGER,
                         GetInCountryCode TEXT,
                         GetInPostalCode TEXT,
                         GetInAddress TEXT,
                         GetInMemo TEXT,
                         GetOutDate TEXT NOT NULL,
                         GetOutTime TEXT NOT NULL,
                         GetOutLat INTEGER,
                         GetOutLng INTEGER,
                         GetOutCountryCode TEXT,
                         GetOutPostalCode TEXT,
                         GetOutAddress TEXT,
                         GetOutMemo TEXT,
                         ViaData TEXT,
                         ViaMemo TEXT,
                         Attribute TEXT,
                         Misc TEXT,
                         PRIMARY KEY(Date,Number)
                     )`).catch(err => {
        console.error('Storage: Unable to create initial storage tables', err.tx, err.err);
      });
  }

  insertLogger(date: string, pending: any): Promise<any> {
    console.log("insertLogger");
    return this.query('SELECT Number FROM Logger where date="'+ date+'"').then(data => {
      console.log("data:");
      console.log(data);
      if (data.res.rows.length > 0) {
        console.log("data.res.rows:");
        console.log(data.res.rows);
        console.log("data.res.rows[0]");
        console.log(data.res.rows[0]);
        // this.number = data.res.rows[0]["Number"] + 1;
        this.number = data.res.rows.length + 1;
      } else {
        this.number = 1;
      }
        var queryString = 'INSERT INTO Logger '
          + '(Date,Number,GetInDate,GetInTime,GetInLat,GetInLng,GetInCountryCode,GetInPostalCode,GetInAddress,GetInMemo,'
          + 'GetOutDate,GetOutTime,GetOutLat,GetOutLng,GetOutCountryCode,GetOutPostalCode,GetOutAddress,GetOutMemo,ViaData,ViaMemo)'
          + ' VALUES('
          + '"' + date + '", '
          + this.number + ', '
          + '"' + pending.GetInDate + '", "' + pending.GetInTime + '", "' + pending.GetInLat + '", "' + pending.GetInLng + '", "' + pending.GetInCountryCode + '", "' + pending.GetInPostalCode + '", "' + pending.GetInAddress + '", "' + pending.GetInMemo + '", '
          + '"' + pending.GetOutDate + '", "' + pending.GetOutTime + '", "' + pending.GetOutLat + '", "' + pending.GetOutLng + '", "' + pending.GetOutCountryCode + '", "' + pending.GetOutPostalCode + '", "' + pending.GetOutAddress + '", "' + pending.GetOutMemo + '", '
          + "'" + JSON.stringify(pending.ViaData) + "'" + ', "' + pending.ViaMemo + '"'
          + ')';
          console.log(queryString);
        return this.query(queryString, []);
    });  
  }

  getLog(date: string): Promise<any> {
    return this.query('SELECT * FROM Logger where Date = "'+ date + '" order by Number desc').then(data => {
      if (data.res.rows.length > 0) {
        console.log('Rows found.');
        if (this.platform.is('cordova') && win.sqlitePlugin) {
          let result = [];
          for (let i = 0; i < data.res.rows.length; i++) {
            var row = data.res.rows.item(i);
            result.push(row);
          }
          return result;
        }
        else {
          return data.res.rows;
        }
      }
    });
  }

  getLogs(): Promise<any> {
    return this.query('SELECT DISTINCT Date from Logger order by Date desc').then(data => {
      if (data.res.rows.length > 0){
        console.log('Rows found.');
        if (this.platform.is('cordova') && win.sqlitePlugin) {
          let result = [];
          for (let i = 0; i < data.res.rows.length; i++) {
            var row = data.res.rows.item(i);
            result.push(row);
          }
          return result;
        }
        else {
          return data.res.rows;
        }
      }
    });
  }

  deleteLog(date: string): Promise<any> {
    return this.query('DELETE from Logger where Date = "'+ date +'"').then(data => {
      if (data.res.rows.length > 0){
        console.log('Rows found.');
        if (this.platform.is('cordova') && win.sqlitePlugin) {
          let result = [];
          for (let i = 0; i < data.res.rows.length; i++) {
            var row = data.res.rows.item(i);
            result.push(row);
          }
          return result;
        }
        else {
          return data.res.rows;
        }
      }
    });
  }

  query(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this._dbPromise.then(db => {
          db.transaction((tx: any) => {
            tx.executeSql(query, params,
              (tx: any, res: any) => resolve({ tx: tx, res: res }),
              (tx: any, err: any) => reject({ tx: tx, err: err }));
          },
            (err: any) => reject({ err: err }));
        });
      } catch (err) {
        reject({ err: err });
      }
    });
  }
}