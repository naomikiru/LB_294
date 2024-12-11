const API_URL = "http://localhost:3000";
let currentCategory = "";


// Simulierte JWT-Erzeugung
function generateJWT(username) {
  return btoa(JSON.stringify({ user: username, exp: Date.now() + 3600000 })); // 1 Stunde Gültigkeit
}

// Login-Funktion
document.getElementById("login-btn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("accounts.json")
    .then((response) => response.json())
    .then((data) => {
      const user = data.users.find((u) => u.username === username && u.password === password);

      if (user) {
        const token = generateJWT(user.username);
        localStorage.setItem("token", token);
        console.log("Login erfolgreich!");
        showMainContent();
      } else {
        document.getElementById("login-error").innerText = "Falscher Benutzername oder Passwort!";
      }
    });
});

// Token validieren
function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const payload = JSON.parse(atob(token));
  return payload.exp > Date.now();
}

// Inhalte anzeigen oder verstecken
function showMainContent() {
  if (isLoggedIn()) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  } else {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("main-content").style.display = "none";
  }
}

// Logout-Funktion
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Sie wurden abgemeldet!");
  showMainContent();
});

// Kategorie-Navigation blockieren, falls nicht eingeloggt
function navigate(category) {
  if (!isLoggedIn()) {
    console.log("Melden Sie sich zuerst an");
    alert("Melden Sie sich zuerst an, um auf Inhalte zuzugreifen.");
    return;
  }
  currentCategory = category;
  document.getElementById("section-title").textContent = `Kategorie: ${category}`;
  console.log(`Navigiert zu: ${category}`);
}

showMainContent();



//  Navigation
function navigate(category) {
  currentCategory = category;
  document.getElementById("section-title").textContent = `Kategorie: ${category}`;
  clearList();
  console.log(`Navigiert zu: ${category}`);
}


// CREATE/Hinzufügen
function createItem(event) {
  event.preventDefault();
  if (!currentCategory) {
    alert("Bitte zuerst eine Kategorie auswählen!");
    return;
  }

  const id = document.getElementById("id").value; // ID als String
  const name = document.getElementById("name").value;
  const size = document.getElementById("size").value;

  if (!id || !name) {
    alert("ID und Name sind erforderlich!");
    return;
  }

  const newItem = { 
    id: id.toString(), // ID als String
    name: name, 
    grösse: size 
  };

  fetch(`${API_URL}/${currentCategory}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newItem),
  }).then((response) => {
    if (response.ok) {
      console.log("Neues Kleidungsstück hinzugefügt:", newItem);
      alert("CREATE erfolgreich!");
      readItems();
    }
  });
}


// READ/Anzeigen
function readItems() {
  if (!currentCategory) {
    alert("Bitte zuerst eine Kategorie auswählen!");
    return;
  }

  fetch(`${API_URL}/${currentCategory}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(`Anzeigen der ${currentCategory}:`, data);
      displayItems(data);
    });
}

// DELETE/Löschen
function deleteItem(id) {
  fetch(`${API_URL}/${currentCategory}/${id}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        console.log(`Kleidungsstück ${id} gelöscht`);
        alert("DELETE erfolgreich!");
        readItems();
      }
    });
}

// UPDATE/Bearbeiten
function updateItem(id) {
  const newName = prompt("Neuer Name:");
  const newSize = prompt("Neue Größe:");

  const updatedItem = {
    id: parseInt(id),
    name: newName || "Unbenannt",
    grösse: newSize || "",
  };

  fetch(`${API_URL}/${currentCategory}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedItem),
  }).then((response) => {
    if (response.ok) {
      console.log(`Kleidungsstück mit ID ${id} aktualisiert`);
      alert("UPDATE erfolgreich!");
      readItems();
    }
  });
}

// Anzeige der Kleidungsstücke mit DELETE und UPDATE Buttons
function displayItems(items) {
  const list = document.getElementById("item-list");
  clearList();

  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ID: ${item.id}, ${item.name} (${item.grösse || "Keine Größe"})
      <button onclick="deleteItem(${item.id})">Löschen</button>
      <button onclick="updateItem(${item.id})">Bearbeiten</button>
    `;
    list.appendChild(li);
  });
}

function clearList() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";
}

document.getElementById("add-form").addEventListener("submit", createItem);
document.querySelector(".read").addEventListener("click", readItems);
