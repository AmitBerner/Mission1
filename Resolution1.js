var request = require('request');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var clientId = "hf38b1gx7qnebpziq77q34ej4x44qdh";
const timestamp = new Date().getTime();
function _RequestCreator(reqUrl,parameters){
  return{
    method: 'GET',
    url: reqUrl,
    qs: parameters,
    headers: {
      'Accept': 'Accept: application/vnd.twitchtv.v3+json',
      'Client-ID': clientId
    },
    json: true
  };
}
function _WriteToFiles(Name,data){
  ViewersFileName = Name+timestamp+'.txt';
  fs.writeFileSync(ViewersFileName,util.inspect(data),'utf-8');
}
function _AppendToFiles(Name,data){
  ViewersFileName = Name+timestamp+'.txt';
  fs.appendFileSync(ViewersFileName,'\n'+util.inspect(data),'utf-8');
}

var totalRun = new EventEmitter();
var StreamViews = _RequestCreator('https://api.twitch.tv/kraken/streams/summary');
var MakeReq = function() {
  request(StreamViews,function(error, response ,data) {
      if(error){
        return console.log(error);
      }
      obj = {totalChannels: data.channels,totalViewers: data.viewers};
      //console.log(obj);
      _WriteToFiles('./Viewers',obj);
    })
  function _GetAllGames(i){
    var reqPar = {limit:100,offset:i};
    var GamesReq = _RequestCreator('https://api.twitch.tv/kraken/games/top',reqPar);
    if(i==0){
      request(GamesReq ,function(error, response ,data) {
        if(error){
          return console.log(error);
        }
        totalRun.data = data._total;
        obj = {totalGames: data._total,top: []};
        for(i in data.top){
          obj.top[i] = {game : data.top[i].game.name, viewers : data.top[i].viewers,channels : data.top[i].channels};
        }
        _WriteToFiles('./Games',obj);
        totalRun.emit('update');
      });
    }
    if(i<totalRun.data && i!=0){
      request(GamesReq ,function(error, response ,data) {
        if(error){
          return console.log(error);
        }
        obj = {totalGames: data._total,top: []};
        for(i in data.top){
          obj.top[i] = {game : data.top[i].game.name, viewers : data.top[i].viewers,channels : data.top[i].channels};
        }
        //console.log(obj);
        _AppendToFiles('./Games',obj.top);
        totalRun.emit('update');
      });
    }
  };
  var i = 0;
  _GetAllGames(0);
  totalRun.on('update',function(){_GetAllGames(i+=100);});
}
exports.MakeReq = MakeReq;
