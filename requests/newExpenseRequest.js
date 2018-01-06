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

function insertNewExpenseForEventIdInSpendings(request){
  const client = new pg.Client();
  client.connect();
    return client.query(
      "select id from participants where id_event=$1 AND id_user=$2",
      [request.params.id,request.user.id]
  )
  .then(response => {
    //console.log(response.rows[0].id);
    return client.query(
      "INSERT INTO spending (id_participant_who_spend, description, amount, date) VALUES ($1,$2,$3,$4)",
      [response.rows[0].id, request.body.expenseDescription, request.body.expensePrice, request.body.expenseDate]
    )
    client.end();
    //console.log(response);
  });

}

function insertNewExpenseDetailForEventIdInRecipients(){
  // const client = new pg.Client();
  // client.connect();
  // /*
  // 2eme insert dans recipients
  // id depense
  // id benificiaire
  // */
  // return client.query(
  //   "INSERT INTO spending (id_participant_who_spend, description, amount, date) VALUES ($1,$2,$3,$4)",
  //   // [event.title, event.date, event.place, '404f2252-e3a3-45fe-8c02-545475ebf37d', event.status])
  //   [event.title, event.date, event.place, user.id, event.status])
  // .then(response => {
  //   client.end();
  //   return response;
  // });

}


//getAllUsersForEventId('0e384628-9391-460c-a51a-9eeff4f11730')
//.then(result => console.log(result.rows));
//http://localhost:3000/events/0f28a2ee-e169-4027-98cb-e05b716718fe/spendings/new


module.exports = {
  getAllEvents : getAllEvents,
  getAllUsersForEventId:getAllUsersForEventId,
  insertNewExpenseForEventIdInSpendings:insertNewExpenseForEventIdInSpendings,
  insertNewExpenseDetailForEventIdInRecipients:insertNewExpenseDetailForEventIdInRecipients
};
