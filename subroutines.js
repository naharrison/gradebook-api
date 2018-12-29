const getSemester = () => {
  const fs = require('fs');
  const obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  return obj.semester;
}



const getStudentIdFromSearch = (searchString) => {
  const db = require('better-sqlite3')('gbook.db');
  const sql_get_full_list = db.prepare('SELECT last,first,middle,pref,sid FROM gbook');
  const full_list = sql_get_full_list.all();

  const full_list_squished = [];
  for(var i = 0; i < full_list.length; i++) {
    const squished_name = full_list[i].first + full_list[i].pref + full_list[i].last;
    full_list_squished.push({name: squished_name, sid: full_list[i].sid});
  }

  var options = {
    caseSensitive: false,
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    threshold: 0.4, // 0.0 will only return exact matches, 1.0 will return anything
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["name"]
  };

  const Fuse = require('fuse.js');
  var fuse = new Fuse(full_list_squished, options);
  var search_result = fuse.search(searchString);

  if(search_result.length == 0) {
    console.log("no students named " + searchString + " found");
    return;
  }
  else if(search_result.length != 1) {
    console.log("Possible matches:");
    console.log(search_result);
    return;
  }
  else if(search_result.length == 1) {
    //console.log(search_result[0].sid);
    return search_result[0].sid;
  }
}



module.exports = {
  getSemester,
  getStudentIdFromSearch
}
