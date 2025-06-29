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

function initializeDeck(){
    deck = [];
    // Cartas numéricas (0-9, 2 de cada una excepto 0) para cada color
    colors.forEach(color => {
        for(let n=0; n<=9; n++) {
            deck.push({color, type:'number', value:n});
            if(n!==0) deck.push({color, type:'number', value:n});
        }
        // Cartas especiales: salto, reversa, roba 2 (2 de cada una por color)
        for(let i=0; i<2; i++) {
            deck.push({color, type:'special', value:'jump'});
            deck.push({color, type:'special', value:'reverse'});
            deck.push({color, type:'special', value:'draw2'});
        }
    });
    // Comodines (4 de cada uno)
    for(let i=0; i<4; i++) {
        deck.push({color:null, type:'wild', value:'wild'});
        deck.push({color:null, type:'wild', value:'draw4'});
    }
    // Mezclar el mazo
    deck = deck.sort(()=>Math.random()-0.5);
}

function startGame(numPlayers){
    players = [];
    for(let i=0; i<numPlayers; i++){
        players.push({
            id: 'player'+(i+1),
            name: 'Jugador '+(i+1),
            cards: [],
            points: 0,
            saidUNO: false,
            isHuman: true // Por ahora todos humanos
        });
    }
    currentPlayerIndex = 0;
    direction = 1;
    initializeDeck();
    dealCards();
}

function dealCards(){
    // Reparte 7 cartas a cada jugador
    for(let i=0; i<players.length; i++){
        players[i].cards = [];
        for(let j=0; j<7; j++){
            players[i].cards.push(deck.pop());
        }
    }
    // Pone la primera carta en el descarte
    discardPile = [deck.pop()];
}

function playCard(playerIndex, card){
    // Verifica si la carta es válida (color o valor igual, o comodín)
    const top = discardPile[discardPile.length-1];
    if(
        card.color === top.color ||
        card.value === top.value ||
        card.type === 'wild'
    ){
        // Quita la carta de la mano del jugador
        const idx = players[playerIndex].cards.findIndex(c => c === card);
        if(idx !== -1){
            players[playerIndex].cards.splice(idx,1);
            discardPile.push(card);
            // Aquí se pueden manejar efectos especiales después
            return true;
        }
    }
    return false;
}

function drawCard(playerIndex){
    if(deck.length === 0) return; // No hay cartas para robar
    const card = deck.pop();
    players[playerIndex].cards.push(card);
}

function nextTurn(){
    currentPlayerIndex = (currentPlayerIndex + direction + players.length) % players.length;
}

function checkUNO(playerIndex){
    // Si al jugador le queda una carta, debe decir UNO
    if(players[playerIndex].cards.length === 1){
        players[playerIndex].saidUNO = true;
        return true;
    }
    return false;
}

function countPoints(winnerIndex){
    // Suma los puntos de las cartas de los demás jugadores
    let points = 0;
    players.forEach((p,i)=>{
        if(i!==winnerIndex){
            p.cards.forEach(card=>{
                if(card.type==='number') points += card.value;
                else if(card.value==='draw2'||card.value==='reverse'||card.value==='jump') points += 20;
                else points += 50; // comodines
            });
        }
    });
    players[winnerIndex].points += points;
}

function resetRound(){
    // Mantiene los puntos, reinicia mazo y manos
    initializeDeck();
    dealCards();
    currentPlayerIndex = 0;
    direction = 1;
    discardPile = [deck.pop()];
    players.forEach(p=>{
        p.cards = [];
        for(let j=0; j<7; j++){
            p.cards.push(deck.pop());
        }
        p.saidUNO = false;
    });
}