const { assert } = require('chai');

const helper = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('undefined', function() {
    const user = helper.getUserbyEmail("a@a.com",testUsers);
    const expectedOutput = "undefined";
    assert.strictEqual(user, expectedOutput);
  });

  // it('should return a user with valid email', function () {
  //   const user = helper.getUserbyEmail("123@test.com", testUsers)
  //   const expectedOutput = "123";
  //   assert.strictEqual(user, expectedOutput);
  // });
});
