let deck=[];;
let discardPile=[];
const colors=['red','green','blue','yellow'];
const specialCards=['jump','reverse','draw2']

let players=[];
let currentPlayerIndex=0;
let direction=1;

const card = {
    id:'R-5',
    color:'red',
    type:'number',
    value:5
};

const player={
    id:'player1',
    name:'Stephanie',
    cards:[],
    points:0,
    saidUNO:false,
    isHuman:true
};

function initializeDeck(){};

function startGame(numPlayers){};

function dealCards(){};

function playCard(playerIndex,card){};

function drawCard(playerIndex){};

function nextTurn(){};

function checkUNO(playerIndex){};

function countPoints(winnerIndex){};

function resetRound(){};