//radiko LIVE放送をcron実行する前に、設定パラメータをradiko.csvに書き込むコード
const consts = require('./const')


const fs = require('fs')

//日付を分解して年と月と日付を取り出す関数
var dateconv=function(predat) {
  var arrayOfStrings = predat.split("-");
  var year=arrayOfStrings[0]
  var month=arrayOfStrings[1]
  var hinichi=arrayOfStrings[2]
  var postdateform=year+month + hinichi
  return postdateform;
}

Y=new Date().getFullYear()
M=new Date().getMonth()+1
D=new Date().getDate()
today=Y + "-" + M +"-" + D
//console.log("today",today)


obj={
  date:dateconv(today),
  jikan:"1000",
  sta:0,
  conti:"false",
  brod:"FMT",
  cnt:0, 
}
  
//console.log("obj")
//console.log(obj)


//辞書型配列をJSON形式に変換している。
var jsondat = JSON.stringify( obj );
console.log("jsondat")
console.log(jsondat)

if (fs.existsSync(consts.CSVPATH)) fs.unlinkSync(consts.CSVFILE)  //上記jsondatを書き込むファイルがすでに存在する場合は当該ファイルを一度削除する。
fs.writeFileSync(consts.CSVPATH,jsondat) //jsondatをJSONFILEPATHに存在するファイルに書き込む 




