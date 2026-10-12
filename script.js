const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxFHSttqJzJoW7gIytCyu-fEilHiHwo8ZDpKhqxnRXlSo8h3VtvOiwOdez1spbWMTb2ug/exec";

const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const closeBtn = document.querySelector(".close");

// 從 Google 雲端硬碟 API 獲取照片資料並顯示
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

            // 點擊放大
            item.addEventListener("click", () => {
                lightbox.style.display = "flex";
                lightboxImg.src = photo.url;
                lightboxCaption.textContent = `${title} (${photo.date})`;
            });

            gallery.appendChild(item);
        });
    })
    .catch(error => {
        console.error("載入失敗：", error);
        loading.textContent = "照片載入失敗，請檢查 API 網址或資料夾存取權限。";
    });

// 關閉燈箱
closeBtn.addEventListener("click", () => lightbox.style.display = "none");
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
});