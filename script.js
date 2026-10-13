const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzUc1oQVsjbmDabjxNyPM155TMtp50_-p8TtnT9pA7lJWespu6_f5hUb6wGW-Zfyfwi/exec";

const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const commentList = document.getElementById("comment-list");
const commentInput = document.getElementById("lightbox-comment-input");
const sendBtn = document.getElementById("send-comment-btn");
const closeBtn = document.querySelector(".close");

let currentPhotoName = ""; // 記錄目前點開的照片檔名

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

            // 點擊放大，載入該照片的留言板內容
            item.addEventListener("click", () => {
                currentPhotoName = photo.name;
                lightbox.style.display = "flex";
                lightboxImg.src = photo.url;
                commentList.textContent = photo.caption || "目前還沒有人留言，趕快留下第一句話吧！";
                commentInput.value = "";
            });

            gallery.appendChild(item);
        });
    })
    .catch(error => {
        console.error("載入失敗：", error);
        loading.textContent = "照片載入失敗，請檢查 API 網址或資料夾存取權限。";
    });

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
        // 即時更新畫面的留言區，將新留言接在後面
        if (commentList.textContent.includes("目前還沒有人留言")) {
            commentList.textContent = text;
        } else {
            commentList.textContent += "\n" + text;
        }
        commentInput.value = "";
        commentList.scrollTop = commentList.scrollHeight; // 自動捲動到最新留言
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
closeBtn.addEventListener("click", () => lightbox.style.display = "none");
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
});