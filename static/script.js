function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    sendImageToServer(e.target.result);
  };
  reader.readAsDataURL(file);
}

function sendImageToServer(imageData) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  })
    .then((res) => res.json())
    .then((data) => {
      const result = document.getElementById("result");
      result.innerHTML = "";
      if (data.error) {
        result.innerHTML = "❌ " + data.error;
        return;
      }
      if (data.safe) {
        result.innerHTML = "✅ No harmful ingredients found!<br>🟢✅ Final Verdict: This product appears to be SAFE.";
      } else {
        result.innerHTML = "<strong>⚠️ Harmful Ingredients Found:</strong><br>";
        data.harmful_found.forEach((item) => {
          result.innerHTML += `
            🧴 Ingredient: ${item.ingredient}<br>
            🔎 Reason: ${Array.isArray(item.reason) ? item.reason.join(", ") : item.reason}<br>
            ⚠️ Risk Level: ${item.risk_level}<br>
            🚑 Health Risks: ${item.health_risks.join(", ")}<br>
            🚫 Banned In: ${item.banned_in.join(", ")}<br><br>
          `;
        });
      }
    })
    .catch((err) => {
      document.getElementById("result").innerHTML = "❌ Error: " + err;
    });
}

document.getElementById("imageInput").addEventListener("change", (e) => {
  handleImageFile(e.target.files[0]);
});

document.getElementById("dropArea").addEventListener("dragover", (e) => {
  e.preventDefault();
  e.target.classList.add("dragover");
});
document.getElementById("dropArea").addEventListener("drop", (e) => {
  e.preventDefault();
  e.target.classList.remove("dragover");
  handleImageFile(e.dataTransfer.files[0]);
});

document.getElementById("captureButton").addEventListener("click", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  video.hidden = false;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      setTimeout(() => {
        canvas.hidden = false;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        stream.getTracks().forEach((track) => track.stop());
        video.hidden = true;
        const imageData = canvas.toDataURL("image/png");
        sendImageToServer(imageData);
      }, 2000);
    })
    .catch((err) => {
      alert("Camera error: " + err);
    });
});
