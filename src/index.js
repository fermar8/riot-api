/*
INSTRUCCIONS

-Clona el backend i inicialitza https://github.com/marcusfifth/spring-boot-spring-security-jwt-authentication/tree/main
-Crea un usuari a la base de dades (contrasenya: 1234 >> $2a$10$ai2zjrpYE0atLI8MyJ1YdOlKB9IdSqzEuozQZ2Wzpwo7.qk/vug6q)
-Inicialitza la base de dades
-Crea un arxiu .env a api-riot root i copia aixo: 
LOL_KEY = la teva key de la api de riot
LOL_BASE_URL = https://euw1.api.riotgames.com
-Inicialitza api-riot >> node src/index.js
-Inicialitza l'app react i fes login.



*/


const express = require("express");
const {json} = require("express");
require("dotenv").config();

const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(json());
app.use(cors());
app.listen(4200);

app.get('/', async (req, res) => {
    res.json({
        message: 'hello world'
    })
})


app.get("/summoner/:summonerName", async (req, res) => {
    const { summonerName } = req.params;

    const summonerIdResponse = await axios
    .get(`${process.env.LOL_BASE_URL}/lol/summoner/v4/summoners/by-name/${encodeURI(summonerName)}`, {
                headers: {
                    "X-Riot-Token": process.env.LOL_KEY
                }
            }
        )
        .catch((e) => {
            return res.status(e.response.status).json(e.response.data);
        });

    const { id, accountId, profileIconId, summonerLevel } = summonerIdResponse.data;
    
    const responseRanked = await axios
    .get(`${process.env.LOL_BASE_URL}/lol/league/v4/entries/by-summoner/${id}`, {
            headers: {
                "X-Riot-Token": process.env.LOL_KEY
            },
        })
        .catch((e) => {
            return res.status(e.response.status).json(e.response.data);
        });
    
    const rankedData = responseRanked.data;

    const responseMatches = await axios 
    .get(`${process.env.LOL_BASE_URL}/lol/match/v4/matchlists/by-account/${accountId}` , {
        headers: {
            "X-Riot-Token": process.env.LOL_KEY
        },
    })
    .catch((e) => {
        return res.status(e.response.status).json(e.response.data);
    });

    const matchesList = responseMatches.data.matches.slice(0, 5).map((el) => {
        return el
    })


        const responseIndividualMatches = await Promise.all (
        matchesList.map(async (match) => {
            const response = await axios 
            .get(`${process.env.LOL_BASE_URL}/lol/match/v4/matches/${match.gameId}`, {
                headers: {
                    "X-Riot-Token": process.env.LOL_KEY
                },
        })
        .catch((e) => {
            return res.status(e.response.status).json(e.response.data);
        });
        return response.data
      })
    )

    const individualMatches = responseIndividualMatches;

    const filterParticipantsArr = individualMatches.map((el) => el.participants)

    const filterParticipants = individualMatches.map((el) => {
        return el.participantIdentities.filter(el => el.player.summonerName === summonerName);
    })


    const g1 = filterParticipantsArr[0].map((el) => {return el})
    const g2 = filterParticipantsArr[1].map((el) => {return el})
    const g3 = filterParticipantsArr[2].map((el) => {return el})
    const g4 = filterParticipantsArr[3].map((el) => {return el})
    const g5 = filterParticipantsArr[4].map((el) => {return el})

    const p1 = filterParticipants[0].map((el) => {return el})
    const p2 = filterParticipants[1].map((el) => {return el})
    const p3 = filterParticipants[2].map((el) => {return el})
    const p4 = filterParticipants[3].map((el) => {return el})
    const p5 = filterParticipants[4].map((el) => {return el})

    const game1 = g1.filter(el => el.participantId === p1[0].participantId).concat(p1)
    const game2 = g2.filter(el => el.participantId === p2[0].participantId).concat(p2)
    const game3 = g3.filter(el => el.participantId === p3[0].participantId).concat(p3)
    const game4 = g4.filter(el => el.participantId === p4[0].participantId).concat(p4)
    const game5 = g5.filter(el => el.participantId === p5[0].participantId).concat(p5)

    const allGames = [game1, game2, game3, game4, game5]


    const responseChampMastery = await axios
    .get(`${process.env.LOL_BASE_URL}/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`, {
        headers: {
            "X-Riot-Token": process.env.LOL_KEY
        },
    })
    .catch((e) => {
        return res.status(e.response.status).json(e.response.data);
    });

    const championMastery = [responseChampMastery.data[0], responseChampMastery.data[1], 
    responseChampMastery.data[2], responseChampMastery.data[4], responseChampMastery.data[5] ]


    return res.json({
        profileIconId,
        summonerLevel,
        rankedData,
        championMastery, 
        allGames
    });
});