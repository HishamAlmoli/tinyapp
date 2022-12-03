const express = require("express");
const app = express();
const PORT = 8080; 
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
// URL Database
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
// usersDatabase
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post(`/urls/:id/delete`, (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send('unable to delete URL that is not yours');
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
// app.post("/urls/:id/delete", (req, res) => {
//   delete urlDatabase["9sm5xK"];
//   res.redirect("/urls");
// });
  
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send("please register to access Create New URL");
  }
  const shortUrlId = getshortUrlId();
  urlDatabase[shortUrlId] = {
    longURL: req.body.longURL,
    userID: userDetails.id
  };
  res.redirect(`/urls/${shortUrlId}`);
});
// app.post("/urls", (req, res) => {
//   console.log(req.body); 
//   Object.assign(urlDatabase, req.body);
//   res.redirect("/urls/:id"); 
// });

app.post("/login", (req, res) => {
  const password = req.body.password;
  const userEmail = req.body.email;
  const foundUser = getUserbyEmail(userEmail, users);
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("need to input email and password");
  }
  if (!foundUser) {
    return res.status(403).send("email cannot be found");
  }
  if (foundUser) {
    const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
    if (!isPasswordCorrect) {
      return res.status(403).send("password is incorrect");
    } else {
      req.session["user_id"] = foundUser.id;
      return res.redirect("/urls");
    }
  }
});
// app.post("/login", (req, res) => {
//   const password = req.body.password;
//   const userEmail = req.body.email;
//   const validUser = getUserbyEmail(userEmail, users);

//   if (validUser) {
//     if (!isPasswordCorrect) {
//       return res.status(403).send(`The email or the password is incorrect`); //password
//     } else {
//       req.session["user_id"] = validUser.id;
//       return res.redirect("/urls");
//     }
//   }
//   return res.status(403).send(`Unknown email`); // anther
// });

app.post("/register", (req, res) => {
  const newUserId = getnewUserId();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("need to input email and password");
  }

  let foundUser = getUserbyEmail(req.body.email, users);
  if (foundUser) {
    return res.status(400).send("user already exists");
  }

  req.session.user_id = newUserId;
  const user = { id: newUserId, email: req.body.email, password: hashedPassword };
  users[newUserId] = user;
  res.redirect("/urls");
});
// app.post("/register", (req, res) => {
//   const newUserId = getnewUserId();
//   const password = req.body.password;

//   if (req.body.email === "" || req.body.password === "") {
//     return res.status(400).send("Enter the email and password");
//   }

//   let validUser = getUserbyEmail(req.body.email, users);
//   if (validUser) {
//     return res.status(400).send("The user is exists");
//   }

//   req.session.user_id = newUserId;
//   const user = { id: newUserId, email: req.body.email};
//   users[newUserId] = user;
//   res.redirect("/urls");
// });

app.get("/register", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    res.render("urls_register");
});

app.get("/login", (req, res) => {
  const userDetails = (users[req.session.user_id]);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    return res.render("urls_login");
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
// app.get("/urls/:id", (req, res) => {
//   const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
//   res.render("urls_show", templateVars);
// });
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

app.get("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);

  if (!userDetails) {
    return res.status(401).send('unable to access. please register or login first');
  }
  const userOwnedURLs = urlsForUser(userDetails.id, urlDatabase);
  const templateVars = { urls: userOwnedURLs, user: users[req.session["user_id"]] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
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