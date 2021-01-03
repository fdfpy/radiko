<template>

  <div class="page">
        <h1>Radiko再生アプリ</h1>
          <h4>  <font size="6"> 状態 : {{ $data.result }}    残り時間{{ formatTime }}</font> </h4>
        <p>ラジオ番組日付<input type="date" id="date" v-model="date">       連続再生 <input type="checkbox" id="continue"  v-model="conti"> </p> 
        <p>ラジオ番組時間 <v-select name="jikan" :options="options"  v-if="!todayf"  v-model="jikan" ></v-select></p>
        <p v-if="todayf"> Live broadcasting </p>
        <p>放送局指定 <v-select name="brod" :options="brodall"  v-if="todayf" v-model="brod" ></v-select></p>　         　　　 
        <p><input type="button" value="ラジオ番組再生" class="btn-gradient-radius" @click="proc()"></p>
        <p><input type="button" value="ラジオ番組停止" class="btn-gradient-radius" @click="end()"></p>
        <p><input type="button" value="入力モードに戻る" class="btn-gradient-radius" @click="repair()"></p>        
        <p><input type="button" value="強制終了 or Reload" class="btn-gradient-radius" @click="endforce()"></p>

           {{$data}}  

        <p><input type="button" value="戻る" class="btn-gradient-radius"　@click="returnButtonClick()"></p>


          **************************  タイマー  ******************************
        <p><input type="button" v-if="!timerOn" value="START" class="btn-gradient-radius" @click="start()"></p>
        <p><input type="button" v-if="timerOn" value="STOP" class="btn-gradient-radius" @click="stop()"></p>
        <p><input type="button" value="RESRT" class="btn-gradient-radius" @click="reset()"></p>

  </div>

                       
</template>


<script>
// eslint-disable-next-line
/* eslint-disable */ 
import Vue from 'vue'
import vSelect from 'vue-select' //ライブラリvue-selectを使用する。機能が追加された選択BOX
import 'vue-select/dist/vue-select.css'
const consts = require('./constrdk')

Vue.component('v-select', vSelect)  


export default {

  name: 'radiko',


  methods:{

    //*************************************************************/
    //(1) タイマー：カウントダウンを行う。連続再生モードでは、指定時間になれば次の番組を再生する。
    //***********************************************************/
    count:  function() {

      if (this.hour==1 && this.sec==0 && this.min==0){
        this.hour=0
        this.min=59
        this.sec=59
       }
       //設定時間が"1900","1930","2130" &「タイムフリー連続再生」設定
      else if( (this.jikan=="1900" ||  this.jikan=="1930"  || this.jikan=="2130") && this.conti==1 &&  this.hour==0 && this.sec == 40 && this.min == 29){
        this.cnt++
        this.end()
       }
         //設定時間が"2115" & 「タイムフリー連続再生」設定     
      else if( (this.jikan=="2115") && this.conti==1 &&  this.hour==0 && this.sec == 20 && this.min == 44){
        this.cnt++
        this.end()
       }
         //設定時間がRadiko RN2放送時間 & 「タイムフリー連続再生」設定    
      else if( !(this.jikan=="1900" ||  this.jikan=="1930"  || this.jikan=="2130" || this.jikan=="2115") && this.conti==1 &&  this.hour==0 && this.sec == 1 && this.min == 0){
        this.cnt++
        this.end()
       }
       　//1secごとにカウントダウンを行う。
      else if(this.hour==0 && this.sec <= 0 && this.min >= 1){
        this.min --;
        this.sec = 59;}

        //0:00:00になればカウントダインを止める。
      else if(this.hour==0 && this.sec <= 0 && this.min <= 0){
        this.complete();
       }
      else{
        this.sec  --
      }

     },


     //(1-2) タイマー：カウントダウンを開始する。
    start: function() {
      let self = this;
      this.timerOn = true; //timerがONであることを状態として保持
      this.timerObj = setInterval(function() {self.count()}, 1000)
     },

     //(1-3)タイマー：タイマーをストップする。
    stop: function() {
      clearInterval(this.timerObj);
      this.timerOn = false; //timerがOFFであることを状態として保持
    },

     //(1-4)タイマー：タイマーをリセットする。
    reset:function(){
      this.hour=1
      this.min=0
      this.sec=24
      this.timerOn = false
     },



    //*************************************************************/
    //(2) proc:一連のメイン同動作を記述する
    //***********************************************************/



    proc: async function(){

      //パラメータ入力モード(sta=99)の場合以下を実行する
      if(this.sta==99){
        await this.getplay() //

        //タイムフリー連続再生モード設定 && sta=1(連続再生モード2週目以降)の場合     
        if(this.conti===true && this.sta==1){
          console.log("41")    
          console.log(this.sta)

            //再生する番組が本日になるまタイムフリー再生を継続する。           
            while(this.conti===true && this.sta==1){       
              console.log("42")        
              console.log(this.sta)         
            await this.getplay()
            }

          //this.result= this.err==0 ? "連続再生終了" : this.result
          location.reload();

         }

         //タイムフリー単発再生の場合、再生終了後、Webページを再読み込みする。
        else if(this.conti==false && this.sta==2){
          location.reload()
         }

         //ライブ放送かつ、「ラジオ番組停止」ボタンをクリックした場合
        else if(this.conti==false && this.sta==0){
          this.result="LIVE放送停止中"
         }

       }

       //パラメータ入力エラー状態で、初期化せずに「ラジオ番組」再生をクリックした場合、警告する。 
      else if(this.sta==-1){
         this.reset()
         alert("エラー発生。「入力モードに戻る」をクリックし再度入力してください")      
      }
      
      
     },


     //*************************************************************/
     //(3) getplay:Radikoを再生する。(メインメソッド)
     //***********************************************************/


     //ラジオ日経第2の指定された時間の番組にアクセスする
    getplay:async function(){
        this.reset() //カウンターをリセットする
        this.result= "Music Playing..."
        this.start()
        this.saisei=true
        //再生したい番組の日にちと時間のデータをバックエンドに転送する。
        await this.$axios.get('http://' + consts.url +'/play',
        
          {params:
                {
                  date:this.date,
                  jikan:this.jikan,
                  brod:this.brod,
                  conti:this.conti,
                  todayf:this.todayf,
                  sta:this.sta
                  //re:this.sta
                }          
          })
          .then(function(response){
            console.log("バックエンドが正常終了した")
            console.log(response.data.message)
            this.result= response.data.message.mes
            this.sta=response.data.message.sta
            //this.err=response.data.message.err

            //入力パラメータ不備がバックエンドから返された場合
            if (this.sta==-1){
              this.stop()
              this.reset()
              }
            
           }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            console.log("#1")
            this.result= "Music Playing..."  
            }.bind(this))
          .finally(function(){
            console.log("#2")
            }.bind(this))
     },


     //*************************************************************/
     //(4) end():再生をストップする処理を行う。
     //***********************************************************/



     //再生をストップする
    end: async function () {

        this.stop()
        this.reset()

         //getplay()実施前に「ラジオ番組停止」をクリックした場合、処理を止める
        if( this.saisei===false ) {
          this.result= "無効操作。「入力モードに戻る」をクリックしてください"
        }
         //正規の処理を実施する。
        else{ 
          this.result= "connecting..."
          await this.$axios.get('http://' + consts.url +'/end')
            .then(function(response){
                console.log("END1")
                this.sta=response.data.message.sta
                console.log(this.sta)
              if(this.sta==1){
                //タイムフリー連続再生
                this.result= "連続再生" + response.data.message.date + "再生中"
                }
              else if(this.sta==0){
                  this.result= "ライブ放送停止中"           
                }
              else if(this.sta==2){
                this.result= "タイムフリー単発停止中"           
                }

              //location.reload();
              }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
            .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
              this.result="サーバーエラー発生1"
                  console.log("END2")
              }.bind(this))
            .finally(function(){
                    console.log("END3")            

              }.bind(this))
                console.log("END FINISH")  
        }
     },

     //*************************************************************/
     //(5) endforce():Xvfb,chromedriver,chromium-browseのプロセスの強制終了を行い、Webページをreloadする。
     //***********************************************************/

    endforce: function () {

        this.stop()
        this.reset()
        this.result= "connecting..."
        this.$axios.get('http://' + consts.url +'/endforce')
          .then(function(response){

            this.result= response.data.message.mes  
  
            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生2"
            }.bind(this))
          .finally(function(){
           location.reload();
            }.bind(this))
          
     },



     //*************************************************************/
     //(6) repair：エラー発生時,sta=-1となるので,パラメータ入力待機状態(sta=99)に戻す。
     //***********************************************************/

    repair: function(){
      this.sta=99
      this.result='Ready'
     },


     //音量を50%設定にする
    vol50: function () {


        this.$axios.get('http://' + consts.url +'/vol50')
          .then(function(response){



            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生1"
            }.bind(this))
          .finally(function(){
            //連続再生モードかつ手動で「ラジオ番組停止」をクリックした場合、RELOADを行う

            }.bind(this))
        console.log("VOL50")  
      },

     //音量を60%設定にする
    vol60: function () {


        this.$axios.get('http://' + consts.url +'/vol60')
          .then(function(response){



            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生1"
            }.bind(this))
          .finally(function(){
            //連続再生モードかつ手動で「ラジオ番組停止」をクリックした場合、RELOADを行う

            }.bind(this))
        console.log("VOL60")  
     },


     //音量を70%設定にする
    vol70: function () {


        this.$axios.get('http://' + consts.url +'/vol70')
          .then(function(response){



            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生1"
            }.bind(this))
          .finally(function(){
            //連続再生モードかつ手動で「ラジオ番組停止」をクリックした場合、RELOADを行う

            }.bind(this))
        console.log("VOL70")  
     },



     //ひとつ前のページに戻る
    returnButtonClick: function () {
        this.$router.go(-1) // 1つ戻る
    },
 
   },





   //「ラジオ番組日付」Boxに入力される値を監視する。値に変化があれば、日付が本日か、それとも本日ではないかを判定する関数
  watch: {
    //指定日と本日との日付け差分を計算する。
      'date': function (val) {
      var d1 = new Date(val); //日付predatを日付型に変更する。
      var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),0,0,0);  //本日の日付を取得している。
      //console.log(today)
      var msDiff = d1.getTime() - today.getTime();
      var daysDiff = msDiff / (1000 * 60 * 60 *24);
      console.log("daysDiff")      
      console.log(daysDiff)
      this.todayf=(daysDiff>-0.375 && daysDiff<0.625 ? true :false);
     },
   },



 
   //タイマー表記 時間:分:秒を常時2桁表記するためのコード
  computed: {
     formatTime: function() {
        let timeStrings = [this.hour.toString(),this.min.toString(),this.sec.toString()].map(function(str) {
        if (str.length < 2) {
          return "0" + str
        } else {
          return str
        }
      })
      return timeStrings[0] + ":" + timeStrings[1] +":" + timeStrings[2]
     }
   },


  data: function(){
    return { 
      result :'Ready',  //状態を格納する変数
      date:'', //番組の日付
      jikan:'', //番組の時間
      options: ['0900','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900','1930','2115','2130'], //選択BOX 「Vue-select」で選択できる番組の時間
      hour: 1,
      min: 0,
      sec: 24,
      timerOn: false,
      timerObj: null,
      todayf:false, //指定した日付が本日か否か？
      brodall:['FMT','RN1','RN2'], //選択BOX 「Vue-select」で選択できる放送局
      brod:'', //放送局
      conti:false, //連続再生するか？
      sta:99,
      cnt:0, //連続再生何回目かを記録する
      saisei:false //「ラジオ番組再生」をクリック:true , 「ラジオ番組再生」クリック前:false
        }  

    }
}
</script>


<style>


  #large_block {
    width: 1000px;
    height: 200px;
    padding: 0px;
    margin: 10px;
    float :left; /* 左側を起点にする */
    border: solid 0.5px; /* 領域のボーダーラインの設定 */
  }   

  .float150 {
    height: 150px;              /* 高さ指定 */
    width: 150px;               /* 幅指定 */
    background-color: #FFF;     /* 背景色指定 */
    margin:  23px;              /* 周りの余白指定 */
    float:  left;   /* 回り込み指定(左から順番に配置していくということ) */
    border: solid 2px #6091d3;/*線*/
    border-radius: 10px;/*角の丸み*/
    padding: 0px;
  }

  .float300 {
    height: 150px;              /* 高さ指定 */
    width: 300px;               /* 幅指定 */
    background-color: #FFF;     /* 背景色指定 */
    margin:  23px;              /* 周りの余白指定*/
    float:  left;   /* 回り込み指定(左から順番に配置していくということ) */
    border: solid 2px #6091d3;/*線*/
    border-radius: 10px;/*角の丸み*/
    padding: 0px;
  }

  h6 {
    font-size: 1.0em;
    padding: 1.5em;
    color: #494949;
    background: #fffaf4;
    border-left: solid 2px #ffaf58;

  } 


  .page {
    width: auto;
    max-width: 800px;
    margin: 0 auto;
    border: 5px solid #ccc;
    padding: 1em;
    background: white;
    border-radius: 1.5em;
  }


  #overlay{
    /*　要素を重ねた時の順番　*/
    z-index:1;

    /*　画面全体を覆う設定　*/
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color:rgba(0,0,0,0.2);    /*　rgb(0,0,0)は黒, a=0.2は透明度　*/

    /*　画面の中央に要素を表示させる設定　*/
    display: flex;
    align-items: center;
    justify-content: center;

  }

  #content{
    z-index:2;
    width:66%;    /*　overlay表示時の白画面が占める大きさ　*/
    padding: 1em;
    background:#fff;
  }


h4 {
  background: #b0dcfa; /*背景色*/
  padding: 0.5em;/*文字周りの余白*/
  color: white;/*文字を白に*/
  border-radius: 0.5em;/*角の丸み*/
}

 /*　ボタン　*/
.btn-gradient-radius {
  display: inline-block;
  padding: 7px 20px;
  border-radius: 25px;
  text-decoration: none;
  color: #FFF;
  background-image: linear-gradient(45deg, #FFC107 0%, #ff8b5f 100%);
  transition: .4s;
}

.btn-gradient-radius:hover {
  background-image: linear-gradient(45deg, #FFC107 0%, #f76a35 100%);
}




/***** radio button css  *********/


.cp_ipradio {
	width: 21%;
	margin: 2em;
	text-align: left;
}
@keyframes click-wave {
	0% {
		position: relative;
		width: 30px;
		height: 30px;
		opacity: 0.35;
	}
	100% {
		width: 200px;
		height: 200px;
		margin-top: -80px;
		margin-left: -80px;
		opacity: 0;
	}
}
.cp_ipradio .option-input {
	position: relative;
	position: relative;
	top: 13.33333px;
	right: 0;
	bottom: 0;
	left: 0;
	width: 30px;
	height: 30px;
	margin-right: 0.5rem;
	cursor: pointer;
	transition: all 0.15s ease-out 0s;
	color: #ffffff;
	border: none;
	outline: none;
	background: #d7cbcb;
	-webkit-appearance: none;
	        appearance: none;
}
.cp_ipradio .option-input:hover {
	background: #d6a9a9;
}
.cp_ipradio .option-input:checked {
	background: #da3c41;
}
.cp_ipradio .option-input:checked::before {
	font-size: 20px;
	line-height: 30px;
	position: absolute;
	display: inline-block;
	width: 30px;
	height: 30px;
	content: '✔';
	text-align: center;
}
.cp_ipradio .option-input:checked::after {
	position: relative;
	display: block;
	content: '';
	-webkit-animation: click-wave 0.65s;
	        animation: click-wave 0.65s;
	background: #da3c41;
}
.cp_ipradio .option-input.radio {
	border-radius: 50%;
}
.cp_ipradio .option-input.radio::after {
	border-radius: 50%;
}
.cp_ipradio label {
	line-height: 40px;
	display: block;
}
.cp_ipradio .option-input:disabled {
	cursor: not-allowed;
	background: #b8b7b7;
}
.cp_ipradio .option-input:disabled::before {
	font-size: 30px;
	line-height: 30px;
	position: absolute;
	display: inline-block;
	width: 30px;
	height: 30px;
	content: '✖︎';
	text-align: center;
}
.cp_ipradio .disabled {
	color: #9e9e9e;
}

.float_test150 {
    height: 200px;              /* 高さ指定 */
    width: 150px;               /* 幅指定 */
    background-color: #FFF;     /* 背景色指定 */
    margin:  10px;              /* 周りの余白指定 */
    float:  right;   /* 回り込み指定 */
    border: solid 3px #6091d3;/*線*/
    border-radius: 10px;/*角の丸み*/
}



</style>



  

