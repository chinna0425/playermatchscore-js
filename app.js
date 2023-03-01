const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
let db_path = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const inititlaizationofdbandserver = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error is ${error.message}`);
    process.exit(1);
  }
};

inititlaizationofdbandserver();

//API 1 GET All

let convertitintoformat = (result) => {
  let myarray = [];
  for (let i = 0; i < result.length; i++) {
    let vs = {
      playerId: result[i].player_id,
      playerName: result[i].player_name,
    };
    myarray.push(vs);
  }
  return myarray;
};

app.get("/players/", async (request, response) => {
  let query = `
    select * from player_details;`;
  let res = await db.all(query);
  response.send(convertitintoformat(res));
});

//API 2 GET

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let query = `
    select * from player_details where player_id=${playerId};`;
  let res = await db.get(query);
  response.send({
    playerId: res.player_id,
    playerName: res.player_name,
  });
});

//API 3 PUT

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  let query = `
    update player_details set player_name='${playerName}' where player_id=${playerId};`;
  let res = await db.run(query);
  response.send("Player Details Updated");
});

//API 4 GET

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let query = `
    select * from match_details where match_id=${matchId};`;
  let res = await db.get(query);
  response.send({
    matchId: res.match_id,
    match: res.match,
    year: res.year,
  });
});

//API 5

let gettinglist = async (result) => {
  let myarray = [];
  for (let i = 0; i < result.length; i++) {
    let qs = `
        select match_id as matchId,match,year from match_details where match_id=${result[i].match_id};`;
    let res = await db.get(qs);
    myarray.push(res);
  }
  return myarray;
};

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let query = `
    select match_id from player_match_score where player_id=${playerId};`;
  let res = await db.all(query);
  let convert = await gettinglist(res);
  response.send(convert);
});

// API 6

let gettingmatch = async (result) => {
  let myarray = [];
  for (let i = 0; i < result.length; i++) {
    let query = `
        select player_id as playerId,player_name as playerName from player_details where player_id=${result[i].player_id};`;
    let cs = await db.get(query);
    myarray.push(cs);
  }
  return myarray;
};
app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let query = `
    select player_id from player_match_score where match_id=${matchId};`;
  let res = await db.all(query);
  let convert = await gettingmatch(res);
  response.send(convert);
});

//API 7

let gettingplayer = async (result) => {
  let myarray = [];
  for (let i = 0; i < result.length; i++) {
    let query = `
        select player_name from player_details where player_id=${result[i].player_id};`;
    let vs = await db.get(query);
    myarray.push({
      playerId: result[i].player_id,
      playerName: vs.player_name,
      totalScore: result[i].totalscore,
      totalFours: result[i].totalfours,
      totalSixes: result[i].toalsixes,
    });
  }
  return myarray[0];
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;
  let query = `
    select 
    player_id,sum(score) as totalscore,sum(fours) as totalfours,sum(sixes) as totalsixes 
    from  
    player_match_score where player_id=${playerId};`;
  let res = await db.all(query);
  let convert = await gettingplayer(res);
  response.send(convert);
});
module.exports = app;
