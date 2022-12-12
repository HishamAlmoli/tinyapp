/* 
    Made by: Hisham Almoli
    Date: Dec 5, 2022
 */
const express = require("express");
const app = express();
const PORT = 8080; 
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

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

const {
  getUserbyEmail,
  getshortUrlId,
  getnewUserId,
  urlsForUser
} = require('./helpers');

/* // Databases \\ */
const urlDatabase = require('./dataUrls');
const users = require('./users');

/* post request: logout button clears the session and redirects to login page */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.redirect("/login");
  //res.send(`Hello!`);
});

app.get("/urls.json", (req, res) => {
  res.send(`<html><body>
  <div>Our URLs Database => ${JSON.stringify(urlDatabase)}</div>
  <div>Our Users Database => ${JSON.stringify(users)}</div>
  </body></html>`);
});

/* get request: rendereds urls_index page */
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

/* get request: rendereds urls_register page */
app.get("/register", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    res.render("urls_register");
});

/* post request: user inputs an email and password to generate userID and redirects to login page */
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

  //console.log(`user: ${user}`)
  users[newUserId] = user;
  res.redirect("/urls");
});

/* get request: rendereds urls_login page */
app.get("/login", (req, res) => {
  const userDetails = (users[req.session.user_id]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    return res.render("urls_login");
});

/* post request: if user input is ok redirects to urls page */
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
    if (bcrypt.compareSync(password, foundUser.password)){
      isPasswordCorrect = true;
    }
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

/* post request: delets url from the database and redirects to urls page */
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

/* post request: redirects to urls page with the shortUrlId parameter */
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

/* post request: redirects to urls page */
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

/* get request: rendereds urls_new page or redirects to login page in case there is no session */
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

/* get request: rendereds urls_show page based on :id parameter */
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

/* get request: redirect to longURL based on urlDatabase */
app.get("/u/:id", (req, res) => {
  const userDetails = users[req.session["user_id"]];

  if (req.params.id === undefined) {
    return res.status(404).send("short URL not found");
  }
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

/* get request: hello page */
app.get("/hello", (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});