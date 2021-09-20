const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username == username);

  if (!user) {
    return response.status(404).send({ error: "Bad request." });
  }
  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const usernameExist = users.find((user) => user.username == username);
  if (!usernameExist) {
    const user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };
    users.push(user);
    return response.status(201).json(user);
  }
  return response.status(400).send({ error: "User already exist" });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const { title, deadline } = request.body;

  user.todos.find((todo) => {
    if (todo.id == id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      return response.json(todo);
    }
  });

  return response.status(404).send({ error: "Todo not found." });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos.find((todo) => {
    if (todo.id == id) {
      todo.done = true;
      return response.json(todo);
    }
  });

  return response.status(404).send({ error: "Todo not found." });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  user.todos.find((todo, i) => {
    if (todo.id == id) {
      deleteTodo = user.todos.splice(i, 1);

      response.status(204).end();
    }
  });

  return response.status(404).send({ error: "Todo not found" });
});

module.exports = app;
