const {getSemester, getStudentInfoFromSearch} = require('./subroutines');



const initializeGradebook = (course, section) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);
  const create_tbl_stmt = 'create table gb_' + course + '_' + section + '(last text, first text, middle text, pref text, sid text, email text, major text, comments text, att text)';
  const sql_create_tbl_stmt = db.prepare(create_tbl_stmt);
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
    const sem = getSemester();
    const dbname = 'gbook_' + sem + '.db';
    const db = require('better-sqlite3')(dbname);
    const add_stmt = 'insert into gb_' + answers.course + '_' + answers.section + ' (last, first, middle, pref, sid, email, major) values(?,?,?,?,?,?,?)';
    const sql_add_stmt = db.prepare(add_stmt);
    sql_add_stmt.run(answers.last, answers.first, answers.middle, answers.pref, answers.sid, answers.email, answers.major);
    db.close();
  });
}



const deleteStudent = (student) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const sinfo = getStudentInfoFromSearch(student);
  const sid = sinfo.sid;
  const table = sinfo.table;
  const sql_stmt = 'sqlite3 ' + dbname + ' "DELETE FROM ' + table + ' WHERE sid=' + sid + '"';
  const { exec } = require('child_process');
  exec(sql_stmt, (err, stdout, stderr) => {
    if (err) return;
  });
}



const importRoster = (file, course, section) => {
  fs = require('fs');
  fs.readFile(file, function (err, data) {
    data = data.toString().replace(/\"/g, ''); // remove quotation marks
    var rows = data.toString().split('\n');
    for(var j = 1; j < rows.length - 1; j++) { // first row is column headings
      var info = rows[j].toString().split(',');
      const sem = getSemester();
      const dbname = 'gbook_' + sem + '.db';
      const db = require('better-sqlite3')(dbname);
      const add_stmt = 'insert into gb_' + course + '_' + section + ' (last, first, middle, pref, sid, email, major) values(?,?,?,?,?,?,?)';
      const sql_add_stmt = db.prepare(add_stmt);
      sql_add_stmt.run(info[0], info[1], info[2], info[3], info[4], info[5], info[7]); // not everything is used
      db.close();
    }
  });
}



const showGradebook = (student) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);
  const sql_get_tables = db.prepare('SELECT name FROM sqlite_master WHERE type="table"');
  const tables = sql_get_tables.all();

  if(student === undefined) {
    for(var i = 0; i < tables.length; i++) {
      const { exec } = require('child_process');
      exec('echo ' + tables[i].name + ' ; sqlite3 -column -header ' + dbname + ' "SELECT * FROM ' + tables[i].name + '"', (err, stdout, stderr) => {
        if (err) return;
        console.log(`${stdout}`);
      });
    }
  }
  else {
    const sinfo = getStudentInfoFromSearch(student);
    const sid = sinfo.sid;
    const table = sinfo.table;
    const { exec } = require('child_process');
    exec('echo ' + table + ' ; sqlite3 -column -header ' + dbname + ' "SELECT * FROM ' + table + ' WHERE sid=' + sid + '"', (err, stdout, stderr) => {
      if (err) return;
      console.log(`${stdout}`);
    });
  }
}



const addGradeColumn = (colname, course, section) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const sql_stmt = 'sqlite3 ' + dbname + ' "ALTER TABLE gb_' + course + '_' + section + ' ADD COLUMN ' + colname + ' FLOAT"';
  const { exec } = require('child_process');
  exec(sql_stmt, (err, stdout, stderr) => {
    if (err) return;
    //console.log(sql_stmt);
  });
}



const addGrade = (colname, student, score) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const sinfo = getStudentInfoFromSearch(student);
  const sid = sinfo.sid;
  const table = sinfo.table;
  const sql_stmt = 'sqlite3 ' + dbname + ' "UPDATE ' + table + ' SET ' + colname + ' = ' + score + ' WHERE sid = ' + sid + '"';
  const { exec } = require('child_process');
  exec(sql_stmt, (err, stdout, stderr) => {
    if (err) return;
    //console.log(sql_stmt);
  });
}



const takeAttendance = (course, section) => {
  // if you want each attendance to be its own column w/ month and day:
  // const sem = getSemester();
  // const date = new Date();
  // const day = date.getDate(); // 1 - 31
  // const month = date.getMonth() + 1; // 0 - 11 (+ 1)
  // const colname = "a_" + month + "_" + day;
  // const dbname = 'gbook_' + sem + '.db';
  // const table = 'gb_' + course + '_' + section;

  // const sql_addcol = 'sqlite3 ' + dbname + ' "ALTER TABLE ' + table + ' ADD COLUMN ' + colname + ' INT"';
  // const { exec } = require('child_process');
  // exec(sql_addcol, (err, stdout, stderr) => { if (err) return; });

  // const db = require('better-sqlite3')(dbname);
  // const sql_get_list = db.prepare('SELECT last,first,middle,pref,sid FROM gb_' + course + '_' + section);
  // const class_list = sql_get_list.all();

  // const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  // var loop = 0;
  // const asyncReadLine = () => {
  //   if(loop >= class_list.length) return readline.close();
  //   const myprompt = class_list[loop].first + " " + class_list[loop].middle + " (" + class_list[loop].pref + ") " + class_list[loop].last + ': ';
  //   loop++;
  //   readline.question(myprompt, (cliin) => {
  //     const sql_stmt = 'sqlite3 ' + dbname + ' "UPDATE ' + table + ' SET ' + colname + ' = ' + cliin + ' WHERE sid = ' + class_list[loop-1].sid + '"';
  //     const { exec } = require('child_process');
  //     exec(sql_stmt, (err, stdout, stderr) => { if (err) return; });
  //     asyncReadLine();
  //   });
  // }
  // asyncReadLine();

  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const table = 'gb_' + course + '_' + section;

  const db = require('better-sqlite3')(dbname);
  const sql_get_list = db.prepare('SELECT last,first,middle,pref,sid,att FROM gb_' + course + '_' + section);
  const class_list = sql_get_list.all();

  const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  var loop = 0;
  const asyncReadLine = () => {
    if(loop >= class_list.length) return readline.close();
    const myprompt = class_list[loop].first + " " + class_list[loop].middle + " (" + class_list[loop].pref + ") " + class_list[loop].last + ': ';
    loop++;
    readline.question(myprompt, (cliin) => {
      var currentAtt = class_list[loop-1].att;
      if(currentAtt == null) currentAtt = "";
      const sql_stmt = 'sqlite3 ' + dbname + ' \'UPDATE ' + table + ' SET att="' + currentAtt + cliin + '" WHERE sid = ' + class_list[loop-1].sid + '\'';
      const { exec } = require('child_process');
      exec(sql_stmt, (err, stdout, stderr) => { if (err) return; });
      asyncReadLine();
    });
  }
  asyncReadLine();
}



const addComment = (student, comment) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);

  const sinfo = getStudentInfoFromSearch(student);
  const sid = sinfo.sid;
  const table = sinfo.table;

  const stmt1 = db.prepare("SELECT comments FROM " + table + " WHERE sid=" + sid);
  var currentComments = stmt1.get().comments;
  if(currentComments == null) currentComments = "";

  const stmt2 = db.prepare('UPDATE ' + table + ' SET comments="' + currentComments + comment + '; "' + ' WHERE sid=' + sid);
  stmt2.run();
}



const calc = (student) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);

  const sinfo = getStudentInfoFromSearch(student);
  const sid = sinfo.sid;
  const table = sinfo.table;

  const stmt1 = db.prepare("SELECT a_1_6 FROM " + table + " WHERE sid=" + sid);
  const a1 = stmt1.get().a_1_6;

  const stmt2 = db.prepare("SELECT a_4_30 FROM " + table + " WHERE sid=" + sid);
  const a2 = stmt2.get().a_4_30;

  console.log(a1+a2);
}



module.exports = {
  initializeGradebook,
  addStudent,
  deleteStudent,
  importRoster,
  showGradebook,
  addGradeColumn,
  addGrade,
  takeAttendance,
  addComment,
  calc
}
