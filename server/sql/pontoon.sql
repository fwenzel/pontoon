create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT);
create unique index username on users (username)
create table stats (userid INT, project text, lang text, string text, str_from text, str_to text)
