const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const statusDiv = document.getElementById("status");
createBtn.addEventListener("click", async () => {
    try {
        window.location.href = `/game`;
    } catch (err) {
        statusDiv.innerText = "Oda oluşturulamadı: " + err.message;
    }
});

joinBtn.addEventListener("click", async () => {
    const code = roomCodeInput.value.trim();
    if (!code) {
        statusDiv.innerText = "Lütfen bir oda kodu girin.";
        return;
    }
    try {
        window.location.href = `/game?roomId=${code}`;
    } catch (err) {
        statusDiv.innerText = "Odaya katılamadın: " + err.message;
    }
});
