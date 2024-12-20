let db;
        const dbName = "UserDatabase";

        function initIndexedDB() {
            const request = indexedDB.open(dbName, 1);

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains("users")) {
                    db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log("IndexedDB Initialized");
            };

            request.onerror = (event) => {
                console.error("IndexedDB Error", event.target.errorCode);
            };
        }

        initIndexedDB();

        // Перевірка статусу мережі
        function isOnline() {
            return navigator.onLine;
        }

        // Емуляція серверної взаємодії
        function fakeServerSave(data) {
            console.log("Дані відправлено на сервер:", data);
            return Promise.resolve("Дані успішно збережено на сервері.");
        }

        function fakeServerFetch() {
            console.log("Дані отримано з сервера.");
            return Promise.resolve([]);
        }

        // Збереження в LocalStorage
        function saveToLocalStorage(user) {
            const users = JSON.parse(localStorage.getItem("users")) || [];
            users.push(user);
            localStorage.setItem("users", JSON.stringify(users));
        }

        // Зчитування з LocalStorage
        function getFromLocalStorage() {
            return JSON.parse(localStorage.getItem("users")) || [];
        }

        // Очищення LocalStorage
        function clearLocalStorage() {
            localStorage.removeItem("users");
        }

        // Додавання даних до IndexedDB
        function saveToIndexedDB(user) {
            const transaction = db.transaction("users", "readwrite");
            const store = transaction.objectStore("users");
            store.add(user);
        }

        // Зчитування з IndexedDB
        function getFromIndexedDB(callback) {
            const transaction = db.transaction("users", "readonly");
            const store = transaction.objectStore("users");
            const request = store.getAll();

            request.onsuccess = () => {
                callback(request.result);
            };
        }

        // Відображення користувачів на сторінці
        function renderUsers(users) {
            const userList = document.getElementById("user-list");
            userList.innerHTML = "";
            users.forEach((user) => {
                const div = document.createElement("div");
                div.textContent = `${user.surname} ${user.name}, ${user.age} років, Освіта: ${user.education}, Посада: ${user.desiredPosition}`;
                userList.appendChild(div);
            });
        }

        // Обробка форми
        document.getElementById("registration-form").addEventListener("submit", async (event) => {
            event.preventDefault();

            const user = {
                surname: document.getElementById("surname").value,
                name: document.getElementById("name").value,
                age: document.getElementById("age").value,
                education: document.getElementById("education").value,
                desiredPosition: document.getElementById("desiredPosition").value,
            };

            if (isOnline()) {
                await fakeServerSave(user);
            } else {
                saveToLocalStorage(user);
            }

            renderUsers([user]);
        });

        // Обробка статусу мережі
        window.addEventListener("online", () => {
            console.log("Користувач онлайн");
            const users = getFromLocalStorage();
            users.forEach(async (user) => {
                await fakeServerSave(user);
            });
            clearLocalStorage();
        });

        window.addEventListener("offline", () => {
            console.log("Користувач офлайн");
        });

        // Ініціалізація при завантаженні сторінки
        window.onload = () => {
            if (isOnline()) {
                fakeServerFetch().then((users) => {
                    renderUsers(users);
                });
            } else {
                renderUsers(getFromLocalStorage());
            }
        };