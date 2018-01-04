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
        console.log(  resultQuery.rows );
        callback(resultQuery.rows);
      }
    }

  );
}


// retrieve 1 event
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

// insert events
function insertEvent( event, callback ){

  const client = new PG.Client();
  client.connect();
  client.query(
    "INSERT INTO events (title, date, place, id_owner, status) VALUES ($1,$2,$3,$4,$5)",
    [event.title, event.date, event.place, '404f2252-e3a3-45fe-8c02-545475ebf37d', event.status],

    function(error, resultQuery){
      client.end();
      if (error) {
        console.log ('je suis dans insertEvent' + event + error);
      } else {
        console.log(  resultQuery.rows );
        callback();
      }
    }

  );
}

// update event
function updateEvent( event, callback ){

  const client = new PG.Client();
  client.connect();
  client.query(
    "UPDATE events SET title=$1, date=$2, place=$3, status = $4 WHERE id = $5",
    [event.title, event.date, event.place,  event.status, event.id],

    function(error, resultQuery){
      client.end();
      if (error) {
        console.log ('je suis dans updateEvent' + event + error);
      } else {
        console.log(  resultQuery.rows );
        callback();
      }
    }

  );
}

// add participant
function addParticipant( first_name, id_event, callback ){
console.log('firstname = '+first_name);
  const client = new PG.Client();
  client.connect();
  client.query(
    "INSERT INTO users (first_name) VALUES ($1) RETURNING *",
    [first_name]
  ).then(resultQuery => {
    console.log(resultQuery.rows[0].id + "/" + id_event);
    return client.query(
      "INSERT INTO participants(id_user, id_event) VALUES ($1,$2) RETURNING *",
      [resultQuery.rows[0].id ,id_event])
  })
  .then(participant => {
    client.end();
    callback();
  })
  .catch(error => console.log(error))
}





module.exports = {
  getAllEvents : getAllEvents,
  getEvent : getEvent,
  insertEvent : insertEvent,
  updateEvent : updateEvent,
  addParticipant : addParticipant
};
