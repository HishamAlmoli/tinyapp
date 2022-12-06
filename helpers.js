
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
  
  module.exports = getUserbyEmail;