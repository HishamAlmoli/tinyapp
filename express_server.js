const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");
app.use(morgan("dev"));

app.use(
  express.urlencoded({ 
    extended: true 
  })
);
app.use(
  cookieSession({
  name: 'session',
  keys: ["user_id"]
  })
);

const getUserbyEmail = require("./helpers.js");

const getshortUrlId = () => Math.random().toString(36).substring(2, 8);
const getnewUserId = () => Math.random().toString(36).substring(2, 8);

const urlsForUser = (userID, urlDatabase) => {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {

  'A1': {
    id: 'A1',
    email: 'q@q',
    password: 'q'
  },

  '123': {
    id: '123',
    email: '123@test.com',
    password: '$2a$10$bZzqDIZ5HuO5.q2DzaTBXuW3bzUD66Takp7aA5e181kpo/Aam3wDO'
  },

  '1234': {
    id: '1234',
    email: 'he@gmail.com',
    password: '$2a$10$LQN2WVqXcTupAhhOdEwyoOxKgPx/DxPYBlcJXj07AKqxP5jhojKta'
  }
};

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.send(`Hello!`);
});

app.get("/urls.json", (req, res) => {
  //res.json(urlDatabase);
  res.send(`<html><body>
  <div>Our URLs Database => ${JSON.stringify(urlDatabase)}</div>
  <div>Our Users Database => ${JSON.stringify(users)}</div>
  </body></html>`);
});

app.get("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);

  if (!userDetails) {
    return res.status(401).send(`<html><body>
    <a href="http://localhost:8080/login">Please visit login page first</a>
    </body></html>`);
  }
  const userOwnedURLs = urlsForUser(userDetails.id, urlDatabase);
  const templateVars = { urls: userOwnedURLs, user: users[req.session["user_id"]] };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    res.render("urls_register");
});

app.post("/register", (req, res) => {
  const newUserId = getnewUserId();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "") {
    return res.status(400).send(`<html><body>
    Ooops, Email cannot be empty!
    <a href="http://localhost:8080/register">Please go back to the register page</a>
    </body></html>`);
  }
  if (req.body.password === "") {
    return res.status(400).send(`<html><body>
    Ooops, Password cannot be empty!
    <a href="http://localhost:8080/register">Please go back to the register page</a>
    </body></html>`);
  }

  let foundUser = getUserbyEmail(req.body.email, users);
  if (foundUser) {
    return res.status(400).send(`<html><body>
    Ooops, You are already in our database
    <a href="http://localhost:8080/login">Please visit login page first</a>
    </body></html>`);
  }

  req.session.user_id = newUserId;
  const user = { id: newUserId, email: req.body.email, password: hashedPassword };
  users[newUserId] = user;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userDetails = (users[req.session.user_id]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    return res.render("urls_login");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const userEmail = req.body.email;
  const foundUser = getUserbyEmail(userEmail, users);

  if (req.body.email === "") {
    return res.status(400).send(`<html><body>
    Ooops, your email cannot be empty!!!
    <a href="http://localhost:8080/login">Please go back to the login page</a>
    </body></html>`);
  }
  if (req.body.password === "") {
    return res.status(400).send(`<html><body>
    Ooops, your password cannot be empty!!!
    <a href="http://localhost:8080/login">Please go back to the login page</a>
    </body></html>`);
  }
  if (!foundUser) {
    return res.status(403).send(`<html><body>
    Ooops, You are not in our database!!!
    <a href="http://localhost:8080/register">Please visit register page first</a>
    </body></html>`);
  }
  if (foundUser) {
    let isPasswordCorrect = false;
    if ( bcrypt.hashSync(password, 10) === foundUser.password) {
      
      isPasswordCorrect = true;
    };
    if (!isPasswordCorrect) {
      return res.status(403).send(`<html><body>
      Ooops, your password is incorrect!!!
      <a href="http://localhost:8080/login">Please go back to the login page</a>
      </body></html>`);
    } else {
      req.session["user_id"] = foundUser.id;
      return res.redirect("/urls");
    }
  }
});

app.post(`/urls/:id/delete`, (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send(`<html><body>
    Ooops, You cannot delete URL that doesn't belong to you!!!
    <a href="http://localhost:8080/urls">Please go back to the urls page</a>
    </body></html>`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send(`<html><body>
    Ooops, Please login first!!!
    <a href="http://localhost:8080/login">Please go back to the login page first</a>
    </body></html>`);
  }
  const shortUrlId = getshortUrlId();
  urlDatabase[shortUrlId] = {
    longURL: req.body.longURL,
    userID: userDetails.id
  };
  res.redirect(`/urls/${shortUrlId}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send('Unable to access. login first to see URLs');
  }
  if (userDetails.id !== urlDatabase[req.params.id].userID) {
    return res.status(401).send("cannot view URL that you do not own");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.session["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const userDetails = users[req.session["user_id"]];

  if (req.params.id === undefined) {
    return res.status(404).send("short URL not found");
  }
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});