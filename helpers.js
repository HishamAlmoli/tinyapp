
const getUserbyEmail = (email, users) => {
    //console.log(`users-helpers ${users}`);
    for (const userId in users) {
      const user = users[userId];
      //console.log(`users-helpers.email ${user.email}`);
      if (user.email === email) {
        return user;
      }
    }
  }
  
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

  module.exports = {
    getUserbyEmail,
    getshortUrlId,
    getnewUserId,
    urlsForUser
  };