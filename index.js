const {getSemester, getStudentInfoFromSearch} = require('./subroutines');



const initializeGradebook = (course, section) => {
  const sem = getSemester();
  const dbname = 'gbook_' + sem + '.db';
  const db = require('better-sqlite3')(dbname);
  const create_tbl_stmt = 'create table gb_' + course + '_' + section + '(last text, first text, middle text, pref text, sid text, email text, major text, comments text)';
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



module.exports = {
  initializeGradebook,
  addStudent,
  importRoster,
  showGradebook,
  addGradeColumn,
  addGrade
}
