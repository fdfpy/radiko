<template>

  <div class="page">
        <h1>Radiko再生アプリ</h1>
          <h4>  <font size="6"> 状態 : {{ $data.result }}    残り時間{{ formatTime }}</font> </h4>
        <p>ラジオ番組日付<input type="date" id="date" v-model="date">  </p>
        <p>ラジオ番組時間 <v-select name="jikan" :options="options" v-model="jikan" ></v-select></p>　         　　　 
        <p><input type="button" value="ラジオ番組再生" class="btn-gradient-radius" @click="getplay()"></p>
        <p><input type="button" value="ラジオ番組停止" class="btn-gradient-radius" @click="end()"></p>
        <p><input type="button" value="強制終了" class="btn-gradient-radius" @click="endforce()"></p>
          <!--  {{$data}} --> 

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

Vue.component('v-select', vSelect)  


export default {

  name: 'radiko',

  methods:{

    //タイマー：カウントダウンを行う。
    count: function() {

      if (this.hour==1 && this.sec==0 && this.min==0){
        this.hour=0
        this.min=59
        this.sec=59
      }else if(this.hour==0 && this.sec <= 0 && this.min >= 1){
        this.min --;
        this.sec = 59;
      }else if(this.hour==0 && this.sec <= 0 && this.min <= 0){
        this.complete();
      }else{
        this.sec  --
      }

    },



    //タイマー：カウントダウンを開始する。
    start: function() {
      let self = this;
      this.timerObj = setInterval(function() {self.count()}, 1000)
      this.timerOn = true; //timerがOFFであることを状態として保持
    },

    //タイマー：タイマーをストップする。
    stop: function() {
      //clearInterval(this.timerObj);
      this.timerOn = false; //timerがOFFであることを状態として保持
    },

    //タイマー：タイマーをリセットする。
    reset:function(){
      this.hour=1
      this.min=0
      this.sec=24
    },


    //complete: function() {
      //clearInterval(this.timerObj)
    //},



    //ラジオ日経第2の指定された時間の番組にアクセスする
    getplay:function(){
        this.reset() //カウンターをリセットする
        this.result= "Music Playing..."
　　　　this.start()
        //再生したい番組の日にちと時間のデータをバックエンドに転送する。
        this.$axios.get('http://192.168.3.6:5000/play',
        
          {params:
                {
                  date:this.date,
                  jikan:this.jikan
                }          
          })
          .then(function(response){

            this.result= response.data.message.mes
        
          }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について

             //番組再生中はradiko.pyは動いているのでバックエンドからフロントエンドに何もデータが戻らないので、正常処理しているにも関わらずerrorが発生する
             //よって、バックエンドから何もデータが返らない場合は正常動作しているので状態をMusic Playingを保持する
            this.result=this.hour==1 ? "サーバーエラー発生" : "Music Playing..."  
              
            }.bind(this))
          .finally(function(){
  
            }.bind(this))
    },

    //再生をストップする
    end: function () {

        this.stop()
        this.reset()
        this.result= "connecting..."
        this.$axios.get('http://192.168.3.6:5000/end')
          .then(function(response){
            //console.log("check")
            //console.log(response)
            this.result= response.data.message.mes  
            console.log("AAAA")
            this.sleep(5000)   
            console.log("BBBB")    
            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生1"
            }.bind(this))
          .finally(function(){

             
            }.bind(this))
          
    },

    //Xvfb,chromedriver,chromium-browseのプロセスの強制終了を行う。
    endforce: function () {

        this.stop()
        this.reset()
        this.result= "connecting..."
        this.$axios.get('http://192.168.3.6:5000/endforce')
          .then(function(response){

            this.result= response.data.message.mes  
  
            //location.reload();
            }.bind(this))  //Promise処理を行う場合は.bind(this)が必要
          .catch(function(error){  //バックエンドからエラーが返却された場合に行う処理について
            this.result="サーバーエラー発生2"
            }.bind(this))
          .finally(function(){

             
            }.bind(this))
          
    },




  　sleep: function(ms) {
      new Promise(r => setTimeout(r,ms))
    },


    

    // dateconv:function (predat) {
    //    var d1 = new Date(predat);
    //    var today = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate(),9,0,0);
    //    var msDiff = d1.getTime() - today.getTime();
    //    var daysDiff = msDiff / (1000 * 60 * 60 *24);
    //    return daysDiff
    // },

    //ひとつ前のページに戻る
    returnButtonClick: function () {
        this.$router.go(-1) // 1つ戻る
    },


  
  },

  created:function(){
        ///
  },
 
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
        options: ['0900','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900','2115','2130'], //選択BOX 「Vue-select」で選択できる番組の時間
        hour: 1,
        min: 0,
        sec: 24,
        timerOn: false,
        timerObj: null,


    }
  },

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



  

