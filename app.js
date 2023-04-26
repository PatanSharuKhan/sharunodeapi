const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const name = "name";
const age = 20;

const initializeServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server is running at port:3000");
  });
};
initializeServer();
module.exports = app;

//get all todo
app.get("/todos/all/", async (req, res) => {
  const query = `SELECT * FROM todo;`;
  const todo = await db.all(query);
  res.send(todo);
});

//add todo
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const query = `SELECT * FROM todo WHERE id=${id}`;
  const queryStatus = await db.get(query);
  if (queryStatus === undefined) {
    const insertQuery = `INSERT INTO todo (id,todo,priority,status)VALUES(${id},"${todo}","${priority}","${status}");`;
    const data = await db.run(insertQuery);
    res.send("Todo Successfully Added");
  } else {
    res.send("Todo with id already exist");
  }
});

//get todo where status is TODO
app.get("/todos/", async (req, res) => {
  const { status = "%%", priority = "%%", search_q = "%%" } = req.query;
  const query = `SELECT * FROM todo WHERE status LIKE "${status}" AND priority LIKE "${priority}" AND todo LIKE "%${search_q}%";`;
  const todo = await db.all(query);
  res.send(todo);
});

//get todo
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todo = await db.get(getTodoQuery);
  res.send(todo);
});

//put todo
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { todo = "*", priority = "*", status = "*" } = req.body;
  if (todo !== "*") {
    const query = `UPDATE todo SET todo="${todo}";`;
    await db.run(query);
    res.send("Todo Updated");
  } else if (priority !== "*") {
    const query = `UPDATE todo SET priority="${priority}";`;
    await db.run(query);
    res.send("Priority Updated");
  } else if (status !== "*") {
    const query = `UPDATE todo SET status="${status}";`;
    await db.run(query);
    res.send("Status Updated");
  }
  const putTodoQuery = `UPDATE todo SET todo todo=${todo},priority`;
});

//delete todo
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  res.send("Todo Deleted");
});
