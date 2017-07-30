Taxi-Loggerを作りながら[Ionic3](http://ionicframework.com/docs/) 等を勉強するプロジェクト

## 出来ること
- 簡易料金計算(古いOSだと使えない？)
- logger:
    - 乗務日、出庫時刻、帰庫予定時刻をリマインダーとして設定出来ます。
    - [乗務開始]ボタンを押すと、出庫からの走行時間を表示します。
    - [休憩開始]ボタンを押すと、休憩時間および総休憩時間を表示します。
    - [休憩終了]ボタンを押すと、休憩時間をリセットし、総休憩時間の加算を停止し、走行時間を表示します。
    - 規定の時間(連続して15分)休憩すると、走行時間をリセットします。それまでは、走行時間も加算します。
    - [乗務終了]ボタンを押すと、総休憩時間など走行に関するタイマーをリセットします。

    - [乗車]、[経由]、[降車]、[取消]、[登録]のボタンを以下の条件で押せます。
        - 走行中のみ、ボタンが表示されます。休憩中には表示されません。
        - 最初は[乗車]しか押せません。
        - [乗車]が押されると、時間と場所をボタンの下に表示し、[経由]、[降車]、[取消]ボタンのみ押せます。
        - [経由]を押すと、押した回数だけ時間と経由地をボタンの下に表示します。
        - [降車]を押すと、時間と場所をボタンの下に表示し、[経由]、[登録]、[取消]ボタンのみ押せます。
        - [降車]が押されている時に[経由]を押すと、[降車]のデータは削除されます。(みんな降りると思ったら経由だし~、という時のため)
        - [取消]を押すと、仕掛りデータを削除できます。全ての仕掛りデータを削除します。
        - [登録]を押すと、データベースに登録してリスト表示されます。
        - 仕掛りデータがある間は、[乗務終了]、[休憩開始]、[休憩終了]のボタンは無効となります。
- 乗務履歴:
    - 今までの乗務履歴を参照できます。
    - 乗車、降車場所を変更したり、メモを追加出来ます。
    - 不要な乗務履歴を削除できます。
    - Google Mapで経路を表示できます。
- イベントスケジュール:
    - 取り敢えずはハードコーディング
## まだ出来ないこと
- 設定
- その他、多くの機能

#### 主に使っているpackage
- [In App Browser](http://ionicframework.com/docs/native/in-app-browser/) : イベントスケジュール表示等に利用。
- [Storage](https://ionicframework.com/docs/storage/) : localStorageから切り替えた。
#### その他
- 
## デモ
[Ionic View](https://view.ionic.io)をインストールすると、このアプリを使えます。ただし、タイミングによってはGit Hubのものとバージョンが異なり、正しく動かない場合も有ります。また、実機ではないためか、場所の取得は出来ません。残念。
app_idは 005a2895 です。

