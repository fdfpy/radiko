const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const consts = require('./const')
CSVPATH='/home/pi/dcshare/radiko/radiko.csv'
JSONFILEPATH_SAMPLE='/home/pi/dcshare/radiko/radikosample.csv'
STATEPATH="/home/pi/dcshare/radiko/radiko.txt"


const app = express()
app.use(bodyParser.json())
var sta=99 //sta=0 Live放送, sta=1 連続再生, sta=2 単独再生, sta=99 初期値


//CORSポリシーを無効にしている。
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



//nodeサーバーを立ち上げる
//app.listen(5000, function () {} );
//app.get('/', (req, res) => res.send('Hello World!'))




const server = app.listen(5000)
server.timeout = 1000 * 60 * 70 * 6 //バックエンドからの応答が70*6minなければ、net::ERR_EMPTY_RESPONSEを出力する。https://kojimanotech.com/2020/06/08/231/


//Frontendから送られるデータ
//date:this.date,
//jikan:this.jikan,
//brod:this.brod,
//cont:this.cont,
//todayf:this.todayf



//指定した番組の再生を行う。
app.get('/play', function(req, res) {
  console.log("playstart")

  //「タイムフリー連続再生」 &  2巡目以降
  if(req.query.sta=="1"){
    jsondat=fs.readFileSync(consts.CSVPATH,'utf-8')
    tmpcnt=JSON.parse(jsondat) //JSONデータ -> 配列へ変換
    var getdate=tmpcnt.date
    var datehani = datediff_re(getdate) //対象の日時と本日との日にち差を計算する。
    console.log("datehani re1")
    console.log(datehani)

    var gettodayf=datehani>=-0.375 && datehani<=0.625 ? "true" : "false"
    var getbrod=tmpcnt.brod
    var getjikan=tmpcnt.jikan
    var getconti=tmpcnt.conti

    var re=1
    console.log("gettodayf")  
    console.log(gettodayf)      
    console.log("tmpcnt")    
    console.log(tmpcnt)
    console.log("re=1")
    }

   //その他
  else if(req.query.sta=="99"){

    //全開異常終了した場合は、radiko.csvの形式が不正でありエラー動作の原因になるので、サンプルデータをradiko.csvに書き込む
    jsondat=fs.readFileSync(consts.CSVPATH_SAMPLE,'utf-8')
    fs.writeFileSync(consts.CSVPATH,jsondat) 


    var getdate=req.query.date
    var gettodayf=req.query.todayf
    var getbrod=req.query.brod
    var getjikan=req.query.jikan
    var getconti=req.query.conti
    var re=0
    console.log("re=0")
    console.log("brod")  
    console.log(req.query.brod)
    console.log("tgettodayf")  
    console.log(gettodayf)  
    console.log("conti")  
    console.log(req.query.conti)
    var datehani = datediff(req.query.date)
    console.log("datehani re0")
    console.log(datehani)    
    }


  //dateが空データか？
  if (getdate==''){
     console.log("0")   
     sta=-1 //sta=-1(エラー設定)にする。
     console.log("sta")
     console.log(sta)    
     res.send({      
       message:          
       {
         "mes":"NG:日付が空欄になっている",
         "sta":-1
       }   
     })
   } 
    
   //dateが空データでない。
  else if(getdate!=''){ 
     console.log("1")   
      //dateは本日か?
      if(gettodayf=='true'){
       console.log("2")
       //放送局空欄か？  
       if (getbrod==''){
         console.log("3")
         sta=-1 //sta=-1(エラー設定)にする。
         res.send({      
          message:          
          {
            "mes":"NG:放送局が空欄になっている",
            "sta":-1
          }   
          })
         } 
         //タイムフリー連続再生モードにて、再生日が本日になればタイムフリー再生動作をやめる。
        else if(re==1){
          sta=-1
          console.log("continue stop")
        }
         //LIVE配信なのでsta=0とする。
        else if (getbrod!='') { sta=0 }
          } 






       //dateは本日ではない。
      else if(gettodayf=='false'){
       console.log("4")   
        //指定された日付が本日より1週間以上前か?
        if(datehani <= -7 || datehani>0){
         console.log("5")
         sta=-1   //dateが本日より1週間以上後または明日以降なのでsta=-1(エラー設定)にする。
         res.send({      
           message:          
           {
             "mes":"NG:本日から1週間前までの期間を選択する",
             "sta":-1
           }   
           })
          }
         //dateが本日より1週間以上前から本日であった。
        else{
         console.log("6") 
           //番組の時間が空欄か？
          if (getjikan=='' ){
           console.log("7")
           sta=-1  //番組の時間が空欄であるので、sta=-1(エラー設定)とする  
           res.send({      
              message:          
               {
                "mes":"NG:時間が空欄",
                "sta":-1
               }   
             })
            }
          else{
            console.log("8")
             //タイムフリー連続再生か?     
            if(getconti=='true' ){
              sta=1 //タイムフリー連続再生
               }
            else{
              sta=2 //タイムフリー単発再生
            }
          }
  
        }

     }
    console.log("11")   
  }
  console.log("sta")
  console.log(sta)
  jsondat=fs.readFileSync(consts.CSVPATH,'utf-8')
  tmpcnt=JSON.parse(jsondat) //JSONデータ -> 配列へ変換
  console.log('jsondat0')
  console.log(tmpcnt) 


  //フロントエンドから送られた日付、時間の形式がOKの場合、本処理を実施する。
　if(sta==0 || sta==1 || sta==2){
    var {PythonShell} = require('python-shell');
    var pyshell = new PythonShell('/home/pi/dcshare/radiko/radiko.py');  
    console.log("20")
    console.log("re=")
    console.log(re)
    console.log("dateconv(getdate)")
    console.log(dateconv(getdate))

    //再生する番組と時間を辞書型配列オブジェクト」objに入れる。
    obj={
      date: re==0 ? dateconv(getdate):getdate, //初回ループ時,getdateはxxxx-xx-xxの形式になっているので、xxxxxxxxxに変形する必要がある。2回目ループ以降は、getdateはxxxxxxxxのままなので何もしない。
      jikan:getjikan,
      sta:sta,
      conti:getconti,
      brod:getbrod,
      cnt:tmpcnt.cnt, 
    }
  
    console.log("obj")
    console.log(obj)
    //辞書型配列をJSON形式に変換している。
    var jsondat = JSON.stringify( obj );
    console.log("jsondat")
    console.log(jsondat)

    if (fs.existsSync(consts.CSVPATH)) fs.unlinkSync(consts.CSVPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。
    fs.writeFileSync(consts.CSVPATH,jsondat) //jsondatをJSONFILEPATHに存在するファイルに書き込む
    pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

    //(不要)アプリのstatusをテキストファイルから読み込む
    //let status_r=fs.readFileSync(STATEPATH,'utf-8')
    
    pyshell.on('message',  function (data) {
        console.log("testdata1")
        console.log(data) //文字列としてpython shellからデータが返却されることに注意
        //console.log(data.DATE) 
        //console.log(data[30]+data[31]+data[32]+data[33]+data[34]+data[35]+data[36]+data[37])   
        var datetmp=data[30]+data[31]+data[32]+data[33]+data[34]+data[35]+data[36]+data[37] //バックエンドから返却されたデータのうち、日付の部分(xxxxxxxx)のみを取り出す
        //console.log("#####")       
        // console.log(data[30])          
        // console.log(data[31])       
        // console.log(data[32])
        // console.log("#1")
        jsondat=fs.readFileSync(consts.CSVPATH,'utf-8')
        // console.log("#2")        
        tmpobj=JSON.parse(jsondat) //JSONデータ -> 配列へ変換
        // console.log("#3")


        obj={
          date: datetmp,
          jikan: tmpobj.jikan,
          sta: tmpobj.sta,
          conti:tmpobj.conti,
          brod:tmpobj.brod,
          cnt:data[18], //data.CNTの数値を取り出す
        }
      
        console.log("objcheck")
        console.log(obj)        
        //辞書型配列をJSON形式に変換している。
        jsondat = JSON.stringify( obj );
        console.log(jsondat)
        console.log("write csv")
        if (fs.existsSync(consts.CSVPATH)) fs.unlinkSync(consts.CSVPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。       
        fs.writeFileSync(consts.CSVPATH,jsondat) //sta=0を書き込む
        console.log("write csv finish")

        res.send({
          message:          
         {
            "mes":"番組は無効->別時間を再設定してください。",
            "sta":obj.sta,
    
          }          
           
      })
      console.log("ressend_end")
      })

  }


 })




 //Xvfb,chromedriver,chromium-browseのプロセスの強制終了を行う。
app.get('/endforce', function(req, res) {

  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/radikoendforce.py');  
  sta=0 //sta=0に設定する。


  //radiko.csvにサンプルデータを書き込む。(異常終了時に不正なデータがradiko.csvに書き込まれるため、その修正を行う)。再生する番組と時間を辞書型配列オブジェクト」objに入れる。

  obj={
    date:"20201225",
    jikan:"1000",
    sta:0,
    conti:"false",
    brod:"FMT",
    cnt:0, 
  }
  
  console.log("obj")
  console.log(obj)
    //辞書型配列をJSON形式に変換している。
  var jsondat = JSON.stringify( obj );
  console.log("jsondat")
  console.log(jsondat)

  if (fs.existsSync(consts.CSVPATH)) fs.unlinkSync(consts.CSVPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。
  fs.writeFileSync(consts.CSVPATH,jsondat) //jsondatをJSONFILEPATHに存在するファイルに書き込む 


  pyshell.send(""); 

  pyshell.on('message',  function (data) {
    // console.log("data")
    // console.log(data)
      res.send({
        message:          
        {
          "mes":"STOP",
        }          
           
      })
      })


  
 })



 //番組再生を停止する。
app.get('/end', function(req, res) {
  console.log("end start")
  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/radikoend.py');  

   //if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。

  jsondat=fs.readFileSync(consts.CSVPATH,'utf-8')
  tmpdat=JSON.parse(jsondat) //JSONデータ -> 配列へ変換
  obj={
    date: tmpdat.date,
    jikan: tmpdat.jikan,
    sta:tmpdat.sta,
    conti:tmpdat.conti,
    brod:tmpdat.brod,
    cnt:tmpdat.cnt, 
   }

   //辞書型配列をJSON形式に変換している。
  var jsondat = JSON.stringify( obj );
  console.log(jsondat)
  fs.writeFileSync(consts.CSVPATH,jsondat)

  pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

  pyshell.on('message',  function (data) {

      res.send({
        message:          
        {
          "mes":"STOP",
          "date":obj.date,
          "sta":obj.sta
        }          
           
      })
  })
  
})





 //音量50%設定(現状使用予定なし)
app.get('/vol50', function(req, res) {
  console.log("vol50")
  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/vol50.py');  
  //sta=0 //sta=0に設定する。
  //if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。


  pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

  pyshell.on('message',  function (data) {

      // res.send({
      //   message:          
      //   {

      //   }          
           
      // })
      })
  
})

 //音量60%設定(現状使用予定なし)
app.get('/vol60', function(req, res) {
  console.log("vol60")
  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/vol60.py');  
  //sta=0 //sta=0に設定する。
  //if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。


  pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

  pyshell.on('message',  function (data) {

      // res.send({
      //   message:          
      //   {

      //   }          
           
      // })
      })
  
})

 //音量70%設定(現状使用予定なし)
app.get('/vol70', function(req, res) {
  console.log("vol70")
  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/vol70.py');  
  //sta=0 //sta=0に設定する。
  //if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。


  pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

  pyshell.on('message',  function (data) {

      // res.send({
      //   message:          
      //   {

      //   }          
           
      // })
      })
  
})



 //フロントエンドから送られてきた日付を分解して年と月と日付を取り出す
var dateconv=function(predat) {
  var arrayOfStrings = predat.split("-");
  var year=arrayOfStrings[0]
  var month=arrayOfStrings[1]
  var hinichi=arrayOfStrings[2]
  var postdateform=year+month + hinichi
  return postdateform;
}

 //2つの日付の差を求める
var datediff=function (predat) {


  var d1 = new Date(predat);
  var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),9,0,0);  //本日の日付を取得している。
  var msDiff = d1.getTime() - today.getTime();
  var daysDiff = msDiff / (1000 * 60 * 60 *24);
  return daysDiff
}

 //2つの日付の差を求める。タイムフリー再生2週目以降は日付けがcsvファイルにxxxxxxxxとして保存されているので、一度xxxx-xx-xxに変換する必要がある。
var datediff_re=function (predat) {
  
  Y=predat[0]+predat[1]+predat[2]+predat[3]
  M=predat[4]+predat[5]
  D=predat[6]+predat[7]

  //日付がxxxxxxxxとして保存されているので、一度xxxx-xx-xxに変換する必要がある。
  YMD=Y+'/'+M+'/'+D
  console.log("Y",Y)
  console.log("M",M)
  console.log("D",D)
  console.log("YMD",YMD)

  var d1 = new Date(YMD)
  var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),9,0,0);  //本日の日付を取得している。
  console.log("today",today)
  console.log("d1",d1) 
  var msDiff = d1.getTime() - today.getTime();
  var daysDiff = msDiff / (1000 * 60 * 60 *24);
  console.log("daysDiff",daysDiff) 
  return daysDiff
}

