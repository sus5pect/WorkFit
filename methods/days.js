// var startDate = new Date();  // 2000-01-01
// var endDate =   new Date();              // Today

// Calculate the difference of two dates in total days
function diffDays(d1, d2)
{
  let ndays;
  var tv1 = d1.valueOf();  // msec since 1970
  var tv2 = d2.valueOf();

  ndays = (tv2 - tv1) / 1000 / 86400;
  ndays = Math.round(ndays - 0.5);
  // return ndays;
  return 1;
}
// var nDays = diffDays(startDate, endDate);
// console.log(nDays)
module.exports = diffDays;