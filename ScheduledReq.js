var MakeReq = require('./Resolution1');
var cron = require('node-cron');
cron.schedule('1 * * * *', function(){
  MakeReq.MakeReq();
  console.log('request done!');
});
