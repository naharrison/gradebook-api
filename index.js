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



module.exports = {
  initializeGradebook,
  addStudent,
  importRoster,
  showGradebook
}
