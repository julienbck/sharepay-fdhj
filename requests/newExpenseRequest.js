const pg = require("pg");

/*

un user crée une depenses pour un event
il choisit les personnes impacté par la dépense (tous, certain)
j'insert cela dans la table

*/


// retrieve all the events
function getAllEvents() {
  const client = new pg.Client();
  client.connect();
  return client.query(`SELECT * FROM EVENTS`)
  .then(response => {
    client.end();
    return response;
  });
}

function getAllUsersForEventId(id) {
  const client = new pg.Client();
  client.connect();
  return client.query(
    "SELECT * FROM participants FULL JOIN events on participants.id_event = events.id FULL JOIN users on participants.id_user = users.id WHERE participants.id_event=$1",
    [id]
  )
  .then(response => {
    client.end();
    return response;
  });
}


//getAllUsersForEventId('0e384628-9391-460c-a51a-9eeff4f11730')
//.then(result => console.log(result.rows));

module.exports = {
  getAllEvents : getAllEvents,
  getAllUsersForEventId:getAllUsersForEventId
};
