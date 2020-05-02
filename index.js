const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
//CSVPATH='/home/pi/notebooks/cafea.csv'
JSONFILEPATH='/home/pi/dcshare/radiko/radiko.csv'
STATEPATH="/home/pi/dcshare/radiko/radiko.txt"


const app = express()
app.use(bodyParser.json())



//CORSポリシーを無効にしている。
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



//nodeサーバーを立ち上げる
app.listen(5000, function () {} );
app.get('/', (req, res) => res.send('Hello World!'))


//指定した番組の再生を行う。
app.get('/play', function(req, res) {
  
  
  var datehani = datediff(req.query.date) //日付形式変換 (例)2020-04-06 -> 0406

  //日付もしくは時間が空欄の場合、エラーを返す
  if (req.query.date=='' || req.query.jikan=='' ){
    //let csvobj_reg=fs.readFileSync(CSVPATH,'utf-8') //エラー時処理のためcsvobj_regを取得している。
    res.send({      
      message:          
      {
        "mes":"日付もしくは時間が空欄になっている",
      }   
    })
  }

  //本日から1週間以内の日付が指定されていない場合
  else if(datehani <= -7 || datehani>0  ){

    res.send({

      message:          
      {
        "mes":"本日から1週間以内の日付を選択する",
      } 
    })
  }


  //フロントエンドから送られた日付、時間の形式がOKの場合、本処理を実施する。
　else{
  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/radiko.py');  

    //再生する番組と時間を辞書型配列オブジェクト」objに入れる。
    obj={
      date: dateconv(req.query.date),
      jikan:req.query.jikan,
    }
  
    //辞書型配列をJSON形式に変換している。
    var jsondat = JSON.stringify( obj );
    //console.log(obj)

    if (fs.existsSync(JSONFILEPATH)) fs.unlinkSync(JSONFILEPATH)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。
    fs.writeFileSync(JSONFILEPATH,jsondat) //jsondatをJSONFILEPATHに存在するファイルに書き込む
    pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

    //アプリのstatusをテキストファイルから読み込む
    let status_r=fs.readFileSync(STATEPATH,'utf-8')
    
    pyshell.on('message',  function (data) {
 
        res.send({
          message:          
         {
            "mes":"番組は無効->別時間を再設定してください。",
          }          
           
      })
      })

  }
})




//Xvfb,chromedriver,chromium-browseのプロセスの強制終了を行う。
app.get('/endforce', function(req, res) {

  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/radikoendforce.py');  
  

  pyshell.send(""); 

  pyshell.on('message',  function (data) {
 
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

  var {PythonShell} = require('python-shell');
  var pyshell = new PythonShell('/home/pi/dcshare/radiko/radikoend.py');  
  

  pyshell.send(""); //jsからpythonコードstockgetall.pyを呼び出す。

  pyshell.on('message',  function (data) {
 
      res.send({
        message:          
        {
          "mes":"STOP",
        }          
           
      })
      })
  
})



//フロントエンドから送られてきた日付を分解して月と日付のみを取り出している
var dateconv=function(predat) {
  var arrayOfStrings = predat.split("-");
  var month=arrayOfStrings[1]
  var hinichi=arrayOfStrings[2]
  var postdateform=month + hinichi
  return postdateform;
}

//2つの日付の差分を求める
var datediff=function (predat) {
  var d1 = new Date(predat);
  var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),9,0,0);  //本日の日付を取得している。
  var msDiff = d1.getTime() - today.getTime();
  var daysDiff = msDiff / (1000 * 60 * 60 *24);
  return daysDiff
}