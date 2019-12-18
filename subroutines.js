const getSemester = () => {
  const fs = require('fs');
  const obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  return obj.semester;
}



const getStudentInfoFromSearch = (searchString) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);

  const sql_get_tables = db.prepare('SELECT name FROM sqlite_master WHERE type="table"');
  const tables = sql_get_tables.all();

  var full_list = [];
  for(var i = 0; i < tables.length; i++) {
    const sql_get_partial_list = db.prepare('SELECT last,first,middle,pref,sid FROM ' + tables[i].name);
    var partial_list = sql_get_partial_list.all();
    for(var j = 0; j < partial_list.length; j++) {
      partial_list[j]["table"] = tables[i].name;
    }
    full_list = full_list.concat(partial_list);
  }

  const full_list_squished = [];
  for(var i = 0; i < full_list.length; i++) {
    const squished_name = full_list[i].first + full_list[i].pref + full_list[i].last;
    full_list_squished.push({squishedname: squished_name, sid: full_list[i].sid, table: full_list[i].table});
  }


  var match_threshold = 0.35;
  if(searchString.charAt(0) >= '0' && searchString.charAt(0) <= '9') match_threshold = 0.0;

  var options = {
    caseSensitive: false,
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    threshold: match_threshold, // 0.0 will only return exact matches, 1.0 will return anything
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["squishedname", "sid"]
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
    return search_result[0];
  }
}



module.exports = {
  getSemester,
  getStudentInfoFromSearch
}
