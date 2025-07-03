const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusDiv = document.getElementById("status");
const dropArea = document.getElementById("drop-area");

let scanHistory = [];

const uploadButton = document.getElementById("uploadButton");
const uploadInput = document.getElementById("upload");
const fileNameDisplay = document.getElementById("fileName");

// ✅ Upload Button
uploadButton.addEventListener("click", () => {
  uploadInput.click();
});

// ✅ Handle File Upload
uploadInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    fileNameDisplay.textContent = `Selected: ${file.name}`;
  } else {
    fileNameDisplay.textContent = "";
    return;
  }

  if (!file.type.startsWith('image/')) {
    showStatus("<span class='highlight-verdict'>❌🚫 Please upload a valid image file.</span>", "error");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function () {
    showStatus("🔍 Sending uploaded image to server...", "warning");
    sendImageToBackend(reader.result);
  };
  reader.readAsDataURL(file);
});

// ✅ Drag and Drop
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.background = "#f0f0f0";
});

dropArea.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropArea.style.background = "";
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.style.background = "";
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onloadend = function () {
      showStatus("🔍 Sending dropped image to server...", "warning");
      sendImageToBackend(reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    showStatus("<span class='highlight-verdict'>❌🚫 Please drop a valid image file.</span>", "error");
  }
});

// ✅ Capture from Camera
function capture() {
  if (!video.videoWidth || !video.videoHeight) {
    showStatus("<span class='highlight-verdict'>❌🚫 Camera not ready or no video feed detected.</span>", "error");
    return;
  }
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  const imageBase64 = canvas.toDataURL("image/png");
  showStatus("🔍 Sending captured image to server...", "warning");
  sendImageToBackend(imageBase64);
}

// ✅ Send Image to Backend
function sendImageToBackend(imageBase64) {
  fetch("http://localhost:5000/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 })
  })
    .then(async response => {
      let data = await response.json();
      if (!response.ok) {
        showStatus(`${data.error || '❌🚫 An unknown error occurred.'}`, "error");
        return;
      }
      showResult(data);
    })
    .catch(err => {
      console.error("Fetch error:", err);
      showStatus("❌🚫 Server communication error. Is your backend running?", "error");
    });
}

// ✅ Show Result
function showResult(data) {
  if (data.error) {
    showStatus(`${data.error}`, "error");
    return;
  }

  let message = "";

  if (data.harmful_found && data.harmful_found.length > 0) {
    message += `<div style="text-align:left; font-weight:bold; font-size:1.1em; margin-bottom:15px; color:#d32f2f;">⚠️ Harmful Ingredients Found:</div>`;

    data.harmful_found.forEach((ingredient) => {
      message += `<div style="margin-bottom:20px; padding:15px; border-left:6px solid #e53935; background:#ffebee; border-radius:10px; text-align:left;">`;

      message += `<div style="display:flex; gap:10px; margin-bottom:8px;">
        <strong style="min-width:130px;">🧴 Ingredient</strong>
        <span>: ${ingredient.ingredient}</span>
      </div>`;

      message += `<div style="display:flex; gap:10px; margin-bottom:8px;">
        <strong style="min-width:130px;">🔎 Reason</strong>
        <span>: ${Array.isArray(ingredient.reason) ? ingredient.reason.join(", ") : ingredient.reason}</span>
      </div>`;

      message += `<div style="display:flex; gap:10px; margin-bottom:8px;">
        <strong style="min-width:130px;">⚠️ Risk Level</strong>
        <span>: ${ingredient.risk_level}</span>
      </div>`;

      message += `<div style="display:flex; gap:10px; margin-bottom:8px;">
        <strong style="min-width:130px;">🚑 Health Risks</strong>
        <span>: ${ingredient.health_risks.join(", ")}</span>
      </div>`;

      message += `<div style="display:flex; gap:10px;">
        <strong style="min-width:130px;">🚫 Banned In</strong>
        <span>: ${ingredient.banned_in.length > 0 ? ingredient.banned_in.join(", ") : "None"}</span>
      </div>`;

      message += `</div>`;
    });

    message += `<span class="highlight-verdict">🔴❌ Final Verdict: This product is NOT SAFE based on the scanned ingredients.</span><br>`;
    message += `<span class="highlight-note">⚠️ Note: Always double-check the product packaging for full ingredient information.</span>`;
    showStatus(message, "error");

  } else {
    message += "✅ No harmful ingredients found!<br>";
    message += `<span class="highlight-verdict" style="color:green;">🟢✅ Final Verdict: This product appears to be SAFE.</span>`;
    showStatus(message, "success");
  }

  // ✅ Store scan history
  scanHistory.push({
    timestamp: new Date().toLocaleString(),
    result: statusDiv.innerText
  });
}

// ✅ Show Status
function showStatus(message, type) {
  statusDiv.innerHTML = message;
  statusDiv.className = type;
  statusDiv.style.display = "block";
}

// ✅ Start camera on load
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      showStatus("✅ Camera started successfully.", "success");
    })
    .catch(error => {
      console.error("Camera error:", error);
      showStatus("❌🚫 Failed to start camera. Please allow camera access or check your device.", "error");
    });
}


