function startGame(players) {
    alert(`Iniciando juego con ${players} jugadores`);
    // Aquí luego agregaremos la lógica del juego
}

function openSettings() {
    alert("Abriendo configuración...");
    // Aquí puedes mostrar opciones como cambiar el fondo, sonido, etc.
}

const colors = ["red", "blue", "green", "yellow"];
const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+2", "🔄", "🚫"];
const specialCards = ["wild", "wild+4"];

// Generar una mano aleatoria de 5 cartas
function generateHand() {
    const playerHand = document.querySelector(".player-hand");
    playerHand.innerHTML = ""; // Limpiar mano

    for (let i = 0; i < 5; i++) {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        let cardType = Math.random() > 0.8 ? "wild" : colors[Math.floor(Math.random() * colors.length)];
        cardDiv.classList.add(cardType);
        cardDiv.textContent = cardType === "wild" ? "🌈" : values[Math.floor(Math.random() * values.length)];

        playerHand.appendChild(cardDiv);
    }
}

generateHand();
