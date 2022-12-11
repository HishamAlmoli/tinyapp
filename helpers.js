/* 
    Made by: Hisham Almoli
    Date: Dec 5, 2022
 */
const getUserbyEmail = (email, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
  }
  
  /* getshortUrlId function generates a unique random string shortURL */
  const getshortUrlId = () => Math.random().toString(36).substring(2, 8);

  /* getnewUserId function generates a unique random string UserId */
  const getnewUserId = () => Math.random().toString(36).substring(2, 8);

  /* urlsForUser function connect shortURL with longURL */
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