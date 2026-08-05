const targetWordInput = document.getElementById('targetWord');
const replacementWordInput = document.getElementById('replacementWord');
const addBtn = document.getElementById('addBtn');
const ruleList = document.getElementById('ruleList');

// Default dictionary
const defaultDictionary = {
  'ei' : 'Mehrzweckei',
  'eier' : 'Mehrzweckeier',    
};

// Load and display rules
function loadRules() {
  chrome.storage.local.get({ customDictionary: defaultDictionary }, (data) => {
    ruleList.innerHTML = ''; // Clear list
    
    for (const [target, replacement] of Object.entries(data.customDictionary)) {
      const li = document.createElement('li');
      li.innerHTML = `<span><strong>${target}</strong> &rarr; ${replacement}</span>`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Remove';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => removeRule(target, data.customDictionary);
      
      li.appendChild(deleteBtn);
      ruleList.appendChild(li);
    }
  });
}

// Add new rule
addBtn.addEventListener('click', () => {
  const target = targetWordInput.value.trim();
  const replacement = replacementWordInput.value.trim();

  if (target && replacement) {
    chrome.storage.local.get({ customDictionary: defaultDictionary }, (data) => {
      const dict = data.customDictionary;
      dict[target] = replacement;
      
      chrome.storage.local.set({ customDictionary: dict }, () => {
        targetWordInput.value = '';
        replacementWordInput.value = '';
        loadRules();
      });
    });
  }
});

// Remove rule
function removeRule(targetToRemove, currentDictionary) {
  delete currentDictionary[targetToRemove];
  chrome.storage.local.set({ customDictionary: currentDictionary }, () => {
    loadRules();
  });
}

// Initialize
loadRules();