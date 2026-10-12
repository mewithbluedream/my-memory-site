const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxFHSttqJzJoW7gIytCyu-fEilHiHwo8ZDpKhqxnRXlSo8h3VtvOiwOdez1spbWMTb2ug/exec";

const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const captionInput = document.getElementById("lightbox-caption-input");
const saveBtn = document.getElementById("save-caption-btn");
const closeBtn = document.querySelector(".close");

let currentPhotoName = ""; // 記錄目前點開的照片檔名

// 從 Google 雲端硬碟 API 獲取照片與備註資料並顯示
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

            // 點擊放大並帶入對應備註
            item.addEventListener("click", () => {
                currentPhotoName = photo.name;
                lightbox.style.display = "flex";
                lightboxImg.src = photo.url;
                captionInput.value = photo.caption || ""; // 將抓到的備註填入輸入框
            });

            gallery.appendChild(item);
        });
    })
    .catch(error => {
        console.error("載入失敗：", error);
        loading.textContent = "照片載入失敗，請檢查 API 網址或資料夾存取權限。";
    });

// 點擊「儲存備註」按鈕時，透過 POST 寫入試算表
saveBtn.addEventListener("click", () => {
    const newCaption = captionInput.value;
    saveBtn.textContent = "儲存中...";

    fetch(GAS_API_URL, {
        method: "POST",
        body: JSON.stringify({
            filename: currentPhotoName,
            caption: newCaption
        })
    })
    .then(res => res.json())
    .then(data => {
        saveBtn.textContent = "儲存成功！";
        setTimeout(() => { 
            saveBtn.textContent = "儲存備註"; 
        }, 2000);
    })
    .catch(err => {
        console.error("儲存失敗", err);
        saveBtn.textContent = "儲存失敗";
        setTimeout(() => { 
            saveBtn.textContent = "儲存備註"; 
        }, 2000);
    });
});

// 關閉燈箱
closeBtn.addEventListener("click", () => lightbox.style.display = "none");
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
});