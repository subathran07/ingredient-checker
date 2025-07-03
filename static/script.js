const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusDiv = document.getElementById("status");
const dropArea = document.getElementById("drop-area");

let scanHistory = []; // ✅ Store scan history for this browser session

// ✅ Upload Button Elements
const uploadButton = document.getElementById("uploadButton");
const uploadInput = document.getElementById("upload");
const fileNameDisplay = document.getElementById("fileName");

// ✅ Upload Button Click
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

// ✅ Capture Image from Camera
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

// ✅ Display Scan Result
function showResult(data) {
  if (data.error) {
    showStatus(`${data.error}`, "error");
    return;
  }

  let message = "";

  if (data.harmful_found && data.harmful_found.length > 0) {
    message += "<strong>⚠️ Harmful Ingredients Found:</strong><br><br>";

    data.harmful_found.forEach((ingredient) => {
      message += `<div style="margin-bottom:15px; padding:10px; border-bottom:1px solid #ccc; text-align:left;">`;
      message += `<div style="display:flex; margin-bottom:4px;"><span style="width:140px;">🧴 <strong>Ingredient</strong></span>: ${ingredient.ingredient}</div>`;
      message += `<div style="display:flex; margin-bottom:4px;"><span style="width:140px;">🔎 <strong>Reason</strong></span>: ${ingredient.reason}</div>`;
      message += `<div style="display:flex; margin-bottom:4px;"><span style="width:140px;">⚠️ <strong>Risk Level</strong></span>: ${ingredient.risk_level}</div>`;
      message += `<div style="display:flex; margin-bottom:4px;"><span style="width:140px;">🚑 <strong>Health Risks</strong></span>: ${ingredient.health_risks.join(", ")}</div>`;
      message += `<div style="display:flex;"><span style="width:140px;">🚫 <strong>Banned In</strong></span>: ${ingredient.banned_in.length > 0 ? ingredient.banned_in.join(", ") : "None"}</div>`;
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

  // ✅ Save to session history
  scanHistory.push({
    timestamp: new Date().toLocaleString(),
    result: statusDiv.innerText
  });

  // ✅ Show download result button
  createDownloadButton(statusDiv.innerText);
}

// ✅ Show status messages
function showStatus(message, type) {
  statusDiv.innerHTML = message;
  statusDiv.className = type;
  statusDiv.style.display = "block";
}

// ✅ Create download result button
function createDownloadButton(text) {
  const downloadButton = document.createElement('button');
  downloadButton.textContent = "📥 Download This Result";
  downloadButton.style.marginTop = "10px";
  downloadButton.onclick = function() {
    downloadResult(text);
  };
  statusDiv.appendChild(downloadButton);
}

// ✅ Export as .txt
function downloadResult(text, filename = "scan_result.txt") {
  const element = document.createElement('a');
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// ✅ Show Full Session History
function showHistory() {
  if (scanHistory.length === 0) {
    alert("No history yet. Perform a scan first!");
    return;
  }

  let historyText = "📜 Scan History:\n\n";
  scanHistory.forEach((entry, index) => {
    historyText += `#${index + 1} - ${entry.timestamp}\n`;
    historyText += `${entry.result}\n\n`;
  });

  downloadResult(historyText, "scan_history.txt");
}

// ✅ Start Camera on Page Load
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      showStatus("✅ Camera started successfully.", "success");
    })
    .catch(error => {
      console.error("Camera error:", error);
      showStatus("<span class='highlight-verdict'>❌🚫 Cannot access camera. Please check permissions.</span>", "error");
    });
} else {
  showStatus("<span class='highlight-verdict'>❌🚫 Camera not supported in this browser.</span>", "error");
}
