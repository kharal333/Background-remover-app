const loading = document.getElementById('loading');
const app = document.getElementById('app');
const upload = document.getElementById('upload');
const removeBtn = document.getElementById('removeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultImg = document.getElementById('resultImg');
const status = document.getElementById('status');

let uploadedFile = null;

// --- Loading screen 5 sec ---
window.addEventListener('load', () => {
  setTimeout(() => {
    loading.style.display = 'none';
    app.style.display = 'flex';
  }, 5000);
});

// --- HEIC / HEIF conversion ---
async function convertHeicToJpeg(file) {
  try {
    const resultBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92
    });
    const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
    return newFile;
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    throw err;
  }
}

// --- Upload handler ---
upload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const lowerName = file.name.toLowerCase();
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                 lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

  try {
    if (isHeic) {
      status.textContent = "Status: Converting HEIC image…";
      uploadedFile = await convertHeicToJpeg(file);
    } else {
      uploadedFile = file;
    }

    const previewURL = URL.createObjectURL(uploadedFile);
    resultImg.src = previewURL;
    status.textContent = "Status: Image Uploaded ✅";
    downloadBtn.disabled = true;
  } catch (err) {
    status.textContent = "Status: HEIC conversion failed! Use JPEG instead.";
    alert("HEIC conversion failed. Try saving as JPEG on your device.");
  }
});

// --- Remove background using Remove.bg API ---
removeBtn.addEventListener('click', async () => {
  if (!uploadedFile) {
    alert("Please upload an image first!");
    return;
  }

  status.textContent = "Status: Removing background…";

  const formData = new FormData();
  formData.append('image_file', uploadedFile);
  formData.append('size', 'auto');

  try {
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': 'yEQYb82qRQakx346vssJiSJG'
      },
      body: formData
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    resultImg.src = url;
    downloadBtn.disabled = false;
    status.textContent = "Status: Background removed ✅";
  } catch (err) {
    console.error(err);
    status.textContent = "Status: Error removing background!";
    alert("Error removing background. Check API key or file type.");
  }
});

// --- Download button ---
downloadBtn.addEventListener('click', () => {
  if (!resultImg.src) return;
  const a = document.createElement('a');
  a.href = resultImg.src;
  a.download = 'result.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
