const pg = require("pg");


function fetchRessourceAll(user) {
  const client = new pg.Client();
  client.connect();
  return client.query(`SELECT * FROM users WHERE email = '${user}'`)
  .then(response => response.rows[0])
}

function fetchRessourceById(email) {
  const client = new pg.Client();
  client.connect();
  return client.query(`SELECT email, password FROM users WHERE email = '${email}'`);
}


module.exports = {
  fetchRessourceAll:fetchRessourceAll,
  fetchRessourceById:fetchRessourceById
};
