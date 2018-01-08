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
    "SELECT *, participants.id AS participantsId FROM participants FULL JOIN events on participants.id_event = events.id FULL JOIN users on participants.id_user = users.id WHERE participants.id_event=$1",
    [id]
  )
  .then(response => {
    client.end();
    return response;
  });
}

function insertNewExpenseForEventIdInSpendings(request){
  const participantWhoBenefitsArray = request.body.recipient
  const client = new pg.Client();
  client.connect();
    return client.query(
      "select id from participants where id_event=$1 AND id_user=$2",
      [request.params.id,request.user.id]
  )
  .then(response => {
    return client.query(
      "INSERT INTO spending (id_participant_who_spend, description, amount, date) VALUES ($1,$2,$3,$4) returning id",
      [response.rows[0].id, request.body.expenseDescription, request.body.expensePrice, request.body.expenseDate]
    )
    .then(queryresponse => {
    insertNewExpenseDetailForEventIdInRecipients(participantWhoBenefitsArray, request.user.id, queryresponse.rows[0].id);
    }

    )
    client.end();
  });

}

function insertNewExpenseDetailForEventIdInRecipients(req, user, spending_id){
  req.forEach(function(participant){

    const client = new pg.Client();
    client.connect();
      return client.query(
           "INSERT INTO recipients (id_spending, id_participant_who_benefits) VALUES ($1,$2)",
          [spending_id, participant]
        )
      client.end();
  })
}


module.exports = {
  getAllEvents : getAllEvents,
  getAllUsersForEventId:getAllUsersForEventId,
  insertNewExpenseForEventIdInSpendings:insertNewExpenseForEventIdInSpendings,
  insertNewExpenseDetailForEventIdInRecipients:insertNewExpenseDetailForEventIdInRecipients
};
