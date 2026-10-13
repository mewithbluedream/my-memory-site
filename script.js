const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzUc1oQVsjbmDabjxNyPM155TMtp50_-p8TtnT9pA7lJWespu6_f5hUb6wGW-Zfyfwi/exec";

const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const commentList = document.getElementById("comment-list");
const commentInput = document.getElementById("lightbox-comment-input");
const sendBtn = document.getElementById("send-comment-btn");
const closeBtn = document.querySelector(".close");

// 塗鴉與顏色選擇 DOM 元素
const canvas = document.getElementById("doodle-canvas");
const ctx = canvas.getContext("2d");
const toggleDoodleBtn = document.getElementById("toggle-doodle-btn");
const clearDoodleBtn = document.getElementById("clear-doodle-btn");
const colorContainer = document.getElementById("color-picker-container");
const colorPicker = document.getElementById("doodle-color-picker");
const colorBtns = document.querySelectorAll(".color-btn");

let currentPhotoName = ""; // 記錄目前點開的照片檔名
let isDrawing = false;
let doodleMode = false;

// 從 Google 雲端硬碟 API 獲取照片與留言資料並顯示
fetch(GAS_API_URL)
    .then(response => response.json())
    .then(photos => {
        loading.style.display = "none";

        if (photos.length === 0) {
            gallery.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>資料夾內目前沒有照片喔！</p>";
            return;
        }

        photos.forEach(photo => {
            const item = document.createElement("div");
            item.className = "gallery-item";
            
            const title = photo.name.replace(/\.[^/.]+$/, "");

            item.innerHTML = `
                <img src="${photo.url}" alt="${title}" loading="lazy">
                <div class="gallery-info">
                    <h3>${title}</h3>
                    <p>${photo.date}</p>
                </div>
            `;

            // 點擊放大，載入該照片的留言板內容與重設畫布
            item.addEventListener("click", () => {
                currentPhotoName = photo.name;
                lightbox.style.display = "flex";
                lightboxImg.src = photo.url;
                commentList.textContent = photo.caption || "目前還沒有人留言，趕快留下第一句話吧！";
                commentInput.value = "";

                // 關閉塗鴉模式
                doodleMode = false;
                updateDoodleUI();
            });

            gallery.appendChild(item);
        });
    })
    .catch(error => {
        console.error("載入失敗：", error);
        loading.textContent = "照片載入失敗，請檢查 API 網址或資料夾存取權限。";
    });

// 當燈箱圖片載入完成時，讓 canvas 大小自動貼合圖片尺寸
lightboxImg.addEventListener("load", () => {
    canvas.width = lightboxImg.clientWidth;
    canvas.height = lightboxImg.clientHeight;
    ctx.strokeStyle = colorPicker.value; // 使用當前選定顏色
    ctx.lineWidth = 4;           // 畫筆粗細
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    clearCanvas();
});

// 切換塗鴉模式開關
toggleDoodleBtn.addEventListener("click", () => {
    doodleMode = !doodleMode;
    updateDoodleUI();
});

function updateDoodleUI() {
    if (doodleMode) {
        canvas.style.pointerEvents = "auto"; // 允許滑鼠畫畫
        toggleDoodleBtn.textContent = "❌ 關閉塗鴉";
        clearDoodleBtn.style.display = "inline-block";
        colorContainer.style.display = "flex"; // 顯示顏色選單
    } else {
        canvas.style.pointerEvents = "none";
        toggleDoodleBtn.textContent = "✏️ 開始塗鴉";
        clearDoodleBtn.style.display = "none";
        colorContainer.style.display = "none";  // 隱藏顏色選單
    }
}

// 監聽色盤變更
colorPicker.addEventListener("input", (e) => {
    ctx.strokeStyle = e.target.value;
});

// 點擊快捷顏色圓點
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const selectedColor = btn.getAttribute("data-color");
        ctx.strokeStyle = selectedColor;
        colorPicker.value = selectedColor; // 同步更新色盤的值
    });
});

// 清除畫布
clearDoodleBtn.addEventListener("click", clearCanvas);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 繪圖事件監聽 (支援滑鼠與手機觸控)
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

// 手機觸控支援
canvas.addEventListener("touchstart", (e) => { startDraw(e); e.preventDefault(); });
canvas.addEventListener("touchmove", (e) => { drawing(e); e.preventDefault(); });
canvas.addEventListener("touchend", stopDraw);

function startDraw(e) {
    if (!doodleMode) return;
    isDrawing = true;
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function drawing(e) {
    if (!isDrawing || !doodleMode) return;
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDraw() {
    isDrawing = false;
}

// 點擊「送出」按鈕時，透過 POST 把新留言追加到試算表
sendBtn.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (!text) return;

    sendBtn.textContent = "傳送中...";

    fetch(GAS_API_URL, {
        method: "POST",
        body: JSON.stringify({
            filename: currentPhotoName,
            comment: text
        })
    })
    .then(res => res.json())
    .then(data => {
        sendBtn.textContent = "送出";
        if (commentList.textContent.includes("目前還沒有人留言")) {
            commentList.textContent = text;
        } else {
            commentList.textContent += "\n" + text;
        }
        commentInput.value = "";
        commentList.scrollTop = commentList.scrollHeight;
    })
    .catch(err => {
        console.error("留言失敗", err);
        sendBtn.textContent = "失敗";
        setTimeout(() => { 
            sendBtn.textContent = "送出"; 
        }, 2000);
    });
});

// 關閉燈箱
closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
    doodleMode = false;
    updateDoodleUI();
});

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = "none";
        doodleMode = false;
        updateDoodleUI();
    }
});