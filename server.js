var express = require("express");
var exphbs = require("express-handlebars");
var mysql = require("mysql");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Create Table



var connection = mysql.createConnection({
  host: process.env.DBHOST || "localhost",
  port: process.env.DBPORT || 3306,
  user: process.env.DBUNAME || "root",
  password: process.env.DBPWD || "rootadmin",
  database: process.env.DBNAME || "burgers_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

// Use Handlebars to render the main index.html page with the burgers in it.
app.get("/", function(req, res) {
  connection.query("SELECT * FROM burgers;", function(err, data) {
    if (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        console.log("creating table");
        connection.query("CREATE TABLE burgers (id int NOT NULL AUTO_INCREMENT, burger varchar(255) NOT NULL, eaten BOOLEAN, PRIMARY KEY (id))", function(err, result) {
          if (err) {
            console.log(err);
            return res.status(500).end();
          }
      
          return res.status(500).end();
        });
        
      }
      return res.status(500).end();
    }

    res.render("index", { burgers: data });
  });
});

// Create a new burger
app.post("/api/burgers", function(req, res) {
  if (! req.body.burger) {
    return res.status(404).end();
  }
  connection.query("INSERT INTO burgers (burger, eaten) VALUES (?, ?)", [req.body.burger, false], function(err, result) {
    if (err) {

      return res.status(500).end();
    }

    res.json({ id: result.insertId });
    console.log({ id: result.insertId });
  });
});

// Eat a burger
app.get("/api/burger/:id", function(req, res) {
  connection.query("UPDATE burgers SET eaten = ? WHERE id = ?", [true, req.params.id], function(err, result) {
    if (err) {
      // If an error occurred, send a generic server failure
      return res.status(500).end();
    }
    else if (result.affectedRows === 0) {
      // If no rows were changed, then the ID must not exist, so 404
      return res.status(404).end();
    }
    res.status(200).end();

  });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
