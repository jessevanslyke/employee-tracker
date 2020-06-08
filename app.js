var mysql = require("mysql");

var PORT = process.env.PORT || 8088;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot",
    database: "employeeDB"
});

connection.connect(function(err) {
    if (err) {
      console.log("error connecting: " + err.stack);
      return;
    }
    console.log("connected as id " + connection.threadId);

    connection.end();
});