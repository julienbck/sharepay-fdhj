const PG = require("pg");


// retrieve all the events
function getAllEvents( callback ){

  const client = new PG.Client();
  client.connect();
  client.query(
    "SELECT title, to_char(date,'DD/MM/YYYY') as date, place, status, id FROM events",
    [],

    function(error, resultQuery){
      client.end();
      if (error) {
        callback({"error":"erreur , dommage !"});
      } else {
        // console.log(  resultQuery.rows );
        callback(resultQuery.rows);
      }
    }

  );
}


// retrieve 1 event
/*
function getEvent( id, callback ){

  const client = new PG.Client();
  client.connect();
  client.query(
    "SELECT * FROM events where id = $1",
    [id],

    function(error, resultQuery){
      client.end();
      if (error) {
        callback({"error":"erreur , dommage !"});
      } else {
        console.log(  resultQuery.rows );
        callback(resultQuery.rows[0]);
      }
    }

  );
}
*/


function getEvent( id, callback ){

  const client = new PG.Client();
  client.connect();
  client.query(
    "SELECT id, title, place, status, to_char(date, 'YYYY-MM-DD') as date FROM events where id = $1",
    [id],
  )
  .then(event => {
    return client.query(
      "SELECT users.id as id_user, users.first_name, participants.id as id_participant FROM users left join participants on participants.id_user = users.id and participants.id_event = $1",
    [id],)
    .then(users => {
      client.end();
      console.log(event.rows);
      console.log(users.rows);
      callback(event.rows[0], users.rows);
    })
  })
  .catch(error => console.log(error))
}


// insert events
function insertEvent( event, user ){


  const client = new PG.Client();
  client.connect();
  return client.query(
    "INSERT INTO events (title, date, place, id_owner, status) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    // [event.title, event.date, event.place, '404f2252-e3a3-45fe-8c02-545475ebf37d', event.status])
    [event.title, event.date, event.place, user.id, event.status])
    .then( (result) => {
      client.end();
      const ev = { id: result.rows[0].id};
      return ev;
    })


}

function fullInsertEvent(event, liste_participants, user){

  console.log(event);
  console.log(liste_participants);
  console.log(user.id);

  return insertEvent(event, user)
    .then((insertedEvent) => addParticipants(liste_participants, insertedEvent));

}

function fullUpdateEvent(event, liste_participants){

  console.log(event);
  console.log(liste_participants);

  return updateEvent(event)
    .then(removeParticipants)
    .then(() => addParticipants(liste_participants, event));

}

// update event
function updateEvent( event ){

  const client = new PG.Client();
  client.connect();
  return client.query(
    "UPDATE events SET title=$1, date=$2, place=$3, status = $4 WHERE id = $5",
    [event.title, event.date, event.place,  event.status, event.id])

    .then( () => client.end() )
    .then( () => event.id)

}

// remove all the participants of 1 event
function removeParticipants (id){
console.log ("je supprime pour id " + id);
  const client = new PG.Client();
  client.connect();
  return client.query(
    "DELETE FROM participants where id_event = $1",
    [id]
  )
  .then( () => client.end() )
  .catch(error => console.log(error))

}

// add participant
function addParticipants( liste_participants, event ){
  if (liste_participants.participants === undefined) {
    return;
  }
  console.log("TOTO event.id = "+event.id);
  console.log("longueur participants = " + liste_participants.participants.length);
  let request = "insert into participants (id_user, id_event) values ";

  let values = [];
  for (let i = 0; i < liste_participants.participants.length ; i++){
    values[i] = "('" + liste_participants.participants[i] + "','" + event.id + "')";
    console.log("value = " + values[i]);
    console.log('TOTO');
  }

  request = request + values.join(",") + ";";
  console.log("request = " + request);

  const client = new PG.Client();
  client.connect();
  return client.query(
    request,
    []
  )
  .then( () => client.end() )
  .catch(error => console.log(error))


}





module.exports = {
  getAllEvents : getAllEvents,
  getEvent : getEvent,
  fullUpdateEvent : fullUpdateEvent,
  fullInsertEvent : fullInsertEvent
};
