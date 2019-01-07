# gradebook-api
An efficient API for managing gradebooks

## Overview
D2L - the standard gradebook tool at UNG - is extremely slow and lacking in features and customizability.
For example, to check the progress of a particular student, you first have to navigate to the school webpage, click through a maze of links, enter your username/password TWICE, browse through a lengthy unorganized list of past, present, and future courses to find the one you want (and do this several times if you're not sure what class the particular student is in), and finally browse through the class roster to find the student you are looking for.
This tool, called B2D2, is 10x if not 100x faster than D2L for simple tasks like this.
It also provides an unlimited amount of customizability.
It is based on SQL and uses Nodejs to automate the most common/repetitive tasks.

## Requirements
sqlite3

nodejs

Once nodejs is installed, add dependencies: `npm install commander inquirer better-sqlite3 fuse.js`

## Comments
Under the hood, students are distingushed by their `sid` (student ID), so it is important that each student has a unique `sid`.

## Demo
The first thing to do is open the `config.json` file and set the `semester` value to the current semester (e.g. `"spring2019"` or `"sp19"`) (you only have to do this once per semester and the value can be any string).

At any time, do `./b2d2 --help` (or just `./b2d2 -h` for the lazy) for a list of all options and commands.

Define the courses/sections you are teaching with the `./b2d2 init <course> <section>` command, e.g.:
```
./b2d2 init 1001 01
./b2d2 init 2002 02
```
This will create a SQL database `gbook_<semester>.db` containing a table `gb_<course>_<section>` for each course/section.

If you download your class roster in CSV format from Banner Web, then you can automatically import the roster with the `./b2d2 import <file> <course> <section>` command.
This repository contains two example CSV files for demo purposes. E.g.:
```
./b2d2 import banner_list1.csv 1001 01
./b2d2 import banner_list2.csv 2002 02
```

If a student registers late and you want to add him/her to the roster, simply do `./b2d2 addstudent` (or `./b2d2 as` for the lazy).
This will walk you though a short list of questions (name, student id, etc.) to add the student.

To quickly display all of your gradebooks, do `./b2d2 show`.
If you want to search for a particular student, use the `-s <student>` option, e.g. `./b2d2 show -s "cos kramr"` will display:
```
gb_2002_02
last        first       middle      pref        sid         email             major       comments  
----------  ----------  ----------  ----------  ----------  ----------------  ----------  ----------
Kramer      Cosmo                   Kramer      900333333   kramer@gmail.com  ENGR                  
```
Note that B2D2 implements a "fuzzy-search" so you needn't spell the student's name exactly correctly.
If the search fails to find exactly one match then it will give you a list of possible matches.

To add grades, first add the grade column with `./b2d2 addgradecolumn <colname> <course> <section>` or just `./b2d2 agc <colname> <course> <section>`, e.g. `./b2d2 agc test1_40 1001 01`.
And then enter the grades for each student with `./b2d2 addgrade <colname> <student> <score>` or just `./b2d2 ag <colname> <student> <score>`, e.g.:
```
./b2d2 ag test1_40 eugene 35
./b2d2 ag test1_40 "patrick star" 7.5
./b2d2 ag test1_40 squidward 32
etc.
```

To quickly take attendance, do `./b2d2 attendance <course> <section>` (or just `./b2d2 att <course> <section>`).
You will receive a prompt for each student, enter `1` for present or `0` for absent.

## More comments and future work
This is a work in progress and only basic functionality has been added so far.
However, since this is based on SQL you have all the power of SQL at your disposal.
Some examples:

Suppose you want to email your whole class, or email all the students who failed the first exam, or email all biology majors.
The following commands will print a copy/paste-able semi-colon separated email list:
```
sqlite3 -newline ';' gbook_spring19.db "select email from gb_1001_01"
sqlite3 -newline ';' gbook_spring19.db "select email from gb_1001_01 where exam1<65"
sqlite3 -newline ';' gbook_spring19.db "select email from gb_1001_01 where major='BIO'"
```

An easy way to create efficient backups is to use `sqlite gbook_spring19.db ".dump"`.
The output can then be saved to the cloud or elsewhere.
It should also be possible to automatically send backups to some cloud location (something like `./b2d2 backup`).

Customizable statistical analysis of grades, histograms, column sorting.

Also store course CRNs in a table (possibly problematic since the code sometimes loops over all tables to search for students).

Add an `addcomment` method.

Display grades only (removing unneeded columns like sid, major, email to save space).
There are some quick/dirty workaround for this:
```
./b2d2 show | cut -c 1-24,75-999999
sqlite3 -column -header gbook_spring19.db "select test1,test2,test3 from gb_1001_01"
```

Tab completion.

Adjust max column width of printout. 
