const pg = require('pg');

function getAllSpendingForEventID(id){
  const client = new pg.Client();
  client.connect();
  return client.query("SELECT s.description, s.amount, p.id_event, u.first_name, to_char(s.date, 'DD/MM/YYYY') AS date FROM participants AS p JOIN events AS e on p.id_event = e.id JOIN spending AS s on id_participant_who_spend=p.id JOIN users AS u on p.id_user = u.id WHERE p.id_event=$1",[id])
  .then(response => {
    console.log(response);
    client.end();
    return response;
  });
}


// getAllSpendingForEventID('d383ac74-0142-406a-b26a-30b965f30d8c')
// .then(result => console.log(result.rows));


module.exports = {
  getAllSpendingForEventID : getAllSpendingForEventID
};
