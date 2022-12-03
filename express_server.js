const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require("cookie-session");


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase["9sm5xK"];
  res.redirect("/urls");
});
  
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body); 
  Object.assign(urlDatabase, req.body);
  res.redirect("/urls/:id"); 
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const userEmail = req.body.email;
  const foundUser = getUserbyEmail(userEmail, users);
  const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

  return res.status(403).send("email cannot be found");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});
