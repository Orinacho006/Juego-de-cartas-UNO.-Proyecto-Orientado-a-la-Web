let deck=[];;
let discardPile=[];
const colors=['red','green','blue','yellow'];
const specialCards=['jump','reverse','draw2']

let players=[];
let currentPlayerIndex=0;
let direction=1;
let currentColor = null; // Color actual del juego (para comodines)

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
    // cartas (0-9, 2 de cada una)
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
    const tipoJuego = localStorage.getItem('tipoJuego') || 'bots';
    for(let i=0; i<numPlayers; i++){
        players.push({
            id: 'player'+(i+1),
            name: 'Jugador '+(i+1),
            cards: [],
            points: 0,
            saidUNO: false,
            isHuman: tipoJuego === 'humanos' ? true : (i === 0)
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

function mostrarSelectorColor(callback) {
    const selector = document.getElementById('selector-color');
    selector.style.display = 'flex';
    const botones = selector.querySelectorAll('.color-btn');
    botones.forEach(btn => {
        btn.onclick = () => {
            selector.style.display = 'none';
            callback(btn.getAttribute('data-color'));
        };
    });
}

function playCard(playerIndex, card) {
    const top = discardPile[discardPile.length - 1];
    const colorToMatch = currentColor || top.color;
    if (
        card.color === colorToMatch ||
        card.value === top.value ||
        card.type === 'wild'
    ) {
        const idx = players[playerIndex].cards.findIndex(c => c === card);
        if (idx !== -1) {
            players[playerIndex].cards.splice(idx, 1);
            discardPile.push(card);

            if (card.type === 'special') {
                if (card.value === 'jump') {
                    nextTurn();
                }
                if (card.value === 'reverse') {
                    direction *= -1;
                    if (players.length === 2) nextTurn();
                }
                if (card.value === 'draw2') {
                    const next = (currentPlayerIndex + direction + players.length) % players.length;
                    drawCard(next);
                    drawCard(next);
                    nextTurn();
                }
                currentColor = card.color;
            }
            if (card.type === 'wild') {
                if (players[playerIndex].isHuman) {
                    mostrarSelectorColor(function(color) {
                        currentColor = color;
                        if (card.value === 'draw4') {
                            const next = (currentPlayerIndex + direction + players.length) % players.length;
                            drawCard(next);
                            drawCard(next);
                            drawCard(next);
                            drawCard(next);
                            nextTurn();
                        }
                        mostrarTodasLasManos();
                        mostrarCartaDescarte(true);
                        nextTurn();
                        mostrarTodasLasManos();
                        mostrarCartaDescarte(true);
                        turnoBot();
                    });
                    return false; // Espera a que elija color
                } else {
                    const coloresEnMano = players[playerIndex].cards.map(c => c.color).filter(c => ['red','green','blue','yellow'].includes(c));
                    if (coloresEnMano.length > 0) {
                        currentColor = coloresEnMano[Math.floor(Math.random() * coloresEnMano.length)];
                    } else {
                        const colores = ['red','green','blue','yellow'];
                        currentColor = colores[Math.floor(Math.random() * 4)];
                    }
                }
                if (card.value === 'draw4') {
                    const next = (currentPlayerIndex + direction + players.length) % players.length;
                    drawCard(next);
                    drawCard(next);
                    drawCard(next);
                    drawCard(next);
                    nextTurn();
                }
            }
            if (card.type !== 'wild') {
                currentColor = card.color;
            }
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

function obtenerRutaImagen(card) {
    if (card.type === 'number' || card.type === 'special') {
        // Mapeo de color JS a nombre de carpeta y sufijo
        const colores = {
            red: { carpeta: 'cartas rojas', sufijo: 'rojo' },
            blue: { carpeta: 'cartas azules', sufijo: 'azul' },
            yellow: { carpeta: 'carta amarillas', sufijo: 'amarillo' },
            green: { carpeta: 'cartas verdes', sufijo: 'verde' }
        };
        const color = colores[card.color];
        if (!color) return '';
        // Cartas especiales
        if (card.type === 'special') {
            if (card.value === 'draw2') return `images/Cartas/${color.carpeta}/+2_${color.sufijo}.png`;
            if (card.value === 'reverse') return `images/Cartas/${color.carpeta}/reversa_${color.sufijo}.png`;
            if (card.value === 'jump') return `images/Cartas/${color.carpeta}/comodin_salto_${color.sufijo}.png`;
        }
        // Cartas numéricas
        return `images/Cartas/${color.carpeta}/${card.value}_${color.sufijo}.png`;
    }
    // Comodines
    if (card.type === 'wild') {
        if (card.value === 'draw4') return 'images/Cartas/comodines generales/+4_comodin.png';
        if (card.value === 'wild') return 'images/Cartas/comodines generales/cambio_color.png';
    }
    return '';
}

function turnoBot() {
    const bot = players[currentPlayerIndex];
    if (!bot || bot.isHuman) return;

    // Buscar la primera carta jugable
    const top = discardPile[discardPile.length - 1];
    const cartaJugada = bot.cards.find(card =>
        card.color === top.color || card.value === top.value || card.type === 'wild'
    );

    if (cartaJugada) {
        playCard(currentPlayerIndex, cartaJugada);
        mostrarTodasLasManos();
        mostrarCartaDescarte(true);
        setTimeout(() => {
            nextTurn();
            mostrarTodasLasManos();
            mostrarCartaDescarte(true);
            turnoBot(); // Por si hay varios bots seguidos
        }, 700);
    } else {
        drawCard(currentPlayerIndex);
        mostrarTodasLasManos();
        setTimeout(() => {
            nextTurn();
            mostrarTodasLasManos();
            turnoBot();
        }, 700);
    }
}

function mostrarTodasLasManos() {
    const posiciones = ['mano-abajo', 'mano-izquierda', 'mano-arriba', 'mano-derecha'];
    for (let i = 0; i < players.length; i++) {
        const div = document.getElementById(posiciones[i]);
        if (!div) continue;
        const manoDiv = div.querySelector('.div-mano');
        manoDiv.innerHTML = '';
        players[i].cards.forEach((card, idx) => {
            let img = document.createElement('img');
            if (i === currentPlayerIndex) {
                img.src = obtenerRutaImagen(card);
                img.alt = `${card.value} ${card.color}`;
                img.className = 'carta-img';
                img.style.cursor = 'pointer';
                img.addEventListener('click', function() {
                    if (playCard(currentPlayerIndex, card)) {
                        mostrarTodasLasManos();
                        mostrarCartaDescarte(true);
                        nextTurn();
                        mostrarTodasLasManos();
                        mostrarCartaDescarte(true);
                        turnoBot();
                    }
                });
            } else {
                img.src = 'images/Cartas/carta trasera/carta_parte_trasera.png';
                img.alt = 'Carta oculta';
                img.className = 'carta-img';
            }
            manoDiv.appendChild(img);
        });
        // Si es el jugador actual, agrego botón para robar carta si no hay jugada válida
        if (i === currentPlayerIndex) {
            const puedeJugar = players[currentPlayerIndex].cards.some(card => {
                const top = discardPile[discardPile.length - 1];
                const colorToMatch = currentColor || top.color;
                return card.color === colorToMatch || card.value === top.value || card.type === 'wild';
            });
            let btnRoba = document.createElement('button');
            btnRoba.textContent = 'Robar carta';
            btnRoba.style.marginLeft = '10px';
            btnRoba.onclick = function() {
                if (puedeJugar) {
                    alert('Aún tienes jugadas válidas.');
                } else {
                    drawCard(currentPlayerIndex);
                    mostrarTodasLasManos();
                    nextTurn();
                    mostrarTodasLasManos();
                    turnoBot();
                }
            };
            manoDiv.appendChild(btnRoba);
            // Botón UNO si solo queda una carta y no ha dicho UNO
            if (
                players[i].cards.length === 1 &&
                players[i].isHuman &&
                !players[i].saidUNO
            ) {
                const btnUNO = document.createElement('button');
                btnUNO.className = 'boton-uno';
                btnUNO.textContent = 'UNO';
                btnUNO.onclick = () => {
                    players[i].saidUNO = true;
                    btnUNO.disabled = true;
                    btnUNO.textContent = '¡UNO!';
                };
                manoDiv.appendChild(btnUNO);
            }
        }
    }
}

function mostrarCartaDescarte(animar = false) {
    const zonaDescarte = document.getElementById('zona-descarte');
    zonaDescarte.innerHTML = 'DESCARTE';
    if (discardPile.length > 0) {
        const carta = discardPile[discardPile.length - 1];
        let img = document.createElement('img');
        img.src = obtenerRutaImagen(carta);
        img.alt = `${carta.value} ${carta.color}`;
        img.className = 'carta-img';
        if (animar) img.classList.add('carta-animada');
        zonaDescarte.appendChild(img);
    }
    // Mostrar solo el recuadro de color
    let color = currentColor;
    if (!color && discardPile.length > 0) color = discardPile[discardPile.length-1].color;
    const colorBox = document.createElement('div');
    colorBox.className = `color-actual color-${color || 'ninguno'}`;
    colorBox.textContent = 'Color';
    zonaDescarte.appendChild(colorBox);
}

function colorNombreEspanol(color) {
    return {
        red: 'Rojo',
        green: 'Verde',
        blue: 'Azul',
        yellow: 'Amarillo'
    }
}

function mostrarMazo() {
    const zonaMazo = document.getElementById('zona-baraja');
    zonaMazo.innerHTML = '';
    if (deck.length > 0) {
        let img = document.createElement('img');
        img.src = 'images/Cartas/carta trasera/carta_parte_trasera.png';
        img.alt = 'Mazo para robar';
        img.className = 'carta-img';
        zonaMazo.appendChild(img);
        zonaMazo.appendChild(document.createTextNode('BARAJA'));
    } else {
        zonaMazo.appendChild(document.createTextNode('BARAJA VACÍA'));
    }
}