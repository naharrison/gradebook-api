const initializeGradebook = () => {
  const dbname = 'gbook.db';
  const fs = require('fs');
  if(fs.existsSync(dbname)) fs.unlinkSync(dbname); // delete if already exists
  const db = require('better-sqlite3')(dbname);
  const sql_create_tbl_stmt = db.prepare('create table gbook(last text, first text, middle text, pref text, sid text, email text, major text, course text, section text, comments text)');
  sql_create_tbl_stmt.run();
  db.close();
}



const addStudent = () => {
  const inquirer = require('inquirer');
  const questions = [
    { type: 'input', name: 'first', message: 'First name' },
    { type: 'input', name: 'middle', message: 'Middle name' },
    { type: 'input', name: 'last', message: 'Last name' },
    { type: 'input', name: 'pref', message: 'Preffered name' },
    { type: 'input', name: 'email', message: 'Email' },
    { type: 'input', name: 'sid', message: 'Student ID' },
    { type: 'input', name: 'major', message: 'Major' },
    { type: 'input', name: 'course', message: 'Course' },
    { type: 'input', name: 'section', message: 'Section' }
  ];

  inquirer.prompt(questions).then(answers => {
    const db = require('better-sqlite3')('gbook.db');
    const sql_add_stmt = db.prepare('insert into gbook (last, first, middle, pref, sid, email, major, course, section) values(?,?,?,?,?,?,?,?,?)');
    sql_add_stmt.run(answers.last, answers.first, answers.middle, answers.pref, answers.sid, answers.email, answers.major, answers.course, answers.section);
    db.close();
  });
}



const importRoster = (file, course, section) => {
  fs = require('fs');
  fs.readFile(file, function (err, data) {
    data = data.toString().replace(/\"/g, ''); // remove quotation marks
    var rows = data.toString().split('\n');
    for(var j = 1; j < rows.length - 1; j++) { // first row is column headings
      var info = rows[j].toString().split(',');
      const db = require('better-sqlite3')('gbook.db');
      const sql_add_stmt = db.prepare('insert into gbook (last, first, middle, pref, sid, email, major, course, section) values(?,?,?,?,?,?,?,?,?)');
      sql_add_stmt.run(info[0], info[1], info[2], info[3], info[4], info[5], info[7], course, section); // not everything is used
      db.close();
    }
  });
}



const showGradebook = () => {
  const { exec } = require('child_process');
  exec('sqlite3 -column -header gbook.db "select * from gbook"', (err, stdout, stderr) => {
    if (err) {
      return;
    }
    console.log(`${stdout}`);
  });
}



const addGradeColumn = (colname) => {
  const sql_stmt = 'sqlite3 gbook.db "ALTER TABLE gbook ADD COLUMN ' + colname + ' FLOAT"';
  const { exec } = require('child_process');
  exec(sql_stmt, (err, stdout, stderr) => {
    if (err) {
      return;
    }
    //console.log(sql_stmt);
  });
}



const addGrade = (colname, student, score) => {
  const sid = getStudentIdFromSearch(student);
  const sql_stmt = 'sqlite3 gbook.db "UPDATE gbook SET ' + colname + ' = ' + score + ' WHERE sid = ' + sid + '"';
  const { exec } = require('child_process');
  exec(sql_stmt, (err, stdout, stderr) => {
    if (err) {
      return;
    }
    //console.log(sql_stmt);
  });
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
  initializeGradebook,
  addStudent,
  importRoster,
  showGradebook,
  addGradeColumn,
  addGrade
}
