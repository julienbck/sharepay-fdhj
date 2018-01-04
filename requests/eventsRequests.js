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


module.exports = {
  getAllEvents : getAllEvents
};
