const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('statusText');

chrome.storage.local.get({ isEnabled: true }, (data) => {
  updateUI(data.isEnabled);
});

toggleSwitch.addEventListener('change', (e) => {
  const newState = e.target.checked;
  
  chrome.storage.local.set({ isEnabled: newState }, () => {
    updateUI(newState);
  });
});

function updateUI(isEnabled) {
  toggleSwitch.checked = isEnabled; 

  statusText.textContent = isEnabled ? "Status: ON" : "Status: OFF";

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (isEnabled) {
    statusText.style.color = isDarkMode ? "#75b798" : "#28a745"; // Green text
  } else {
    statusText.style.color = isDarkMode ? "#ea868f" : "#dc3545"; // Red text
  }
}