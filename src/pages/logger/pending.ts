export default class MyPending {
    pending: { [key: string]: any; } = {};
    date: string;
    time: string;
    public loadPending(pending) {
        return pending;
    }
    public initPending() {
        this.pending["GetInDate"] = "";
        this.pending["GetInTime"] = "";
        this.pending["GetInPlace"] = "";
        this.pending["GetOutDate"] = "";
        this.pending["GetOutTime"] = "";
        this.pending["GetOutPlace"] = "";
        this.pending["ViaData"] = [];
        this.pending["GetInMemo"] = "";
        this.pending["GetOutMemo"] = "";
        this.pending["ViaMemo"] = "";
        return this.pending;
    }
    public isPending(key: string = null) {
        return true;
    }
    public updatePending(pending, key) {
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
                break;
            case 'GetOut':
                pending["GetOutDate"] = this.date;
                pending["GetOutTime"] = this.time;
                break;
            case 'Via':
             pending["ViaData"].push({date:this.date,time:this.time});
        }
        console.log(pending);
        return pending;
    }
}
export { MyPending };
