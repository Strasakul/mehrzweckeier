let compiledDictionary = new Map();
let isEnabled = true;

// Compile dictionary into regex
function buildDictionary(dictObj) {
    compiledDictionary.clear();
    for (const [key, value] of Object.entries(dictObj)) {
        compiledDictionary.set(new RegExp(`\\b${key}\\b`, 'gi'), value);
    }
}

function replaceTextInNode(node) {
    // If it is a Text Node, run the replacement
    if(node.nodeType === 3 && node.nodeValue.trim() !== ''){
        let newText = node.nodeValue;

        for(const [regex, replacement] of compiledDictionary){
            newText = newText.replace(regex, replacement);
        }

        if(newText !== node.nodeValue){
            node.nodeValue = newText;
        }

    // If it is an Element Node (like a div, span, input, etc.)
    } else if (node.nodeType === 1){
        const tag = node.nodeName.toUpperCase();

        // SKIP input fields, textareas, scripts, styles, and editable chat boxes
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'INPUT' || tag === 'TEXTAREA' || node.isContentEditable) {
            return; 
        }

        // Otherwise, it's safe to recursively check its children
        for(let i = 0; i < node.childNodes.length; i++){
            replaceTextInNode(node.childNodes[i]);
        }
    }
}


// Initial load check
chrome.storage.local.get({ 
    isEnabled: true, 
    customDictionary: {
        'ei' : 'Mehrzweckei',
        'eier' : 'Mehrzweckeier',
    }
}, (data) => {
    isEnabled = data.isEnabled;
    buildDictionary(data.customDictionary);
  
    if (isEnabled) {
        replaceTextInNode(document.body);
    }
});

// Dynamic state change listener
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
    
        // If the user added or removed a word in the options
        if (changes.customDictionary) {
            buildDictionary(changes.customDictionary.newValue);
            if (isEnabled) replaceTextInNode(document.body);
        }

        // If the user flipped the switch in the popup
        if (changes.isEnabled) {
            isEnabled = changes.isEnabled.newValue;
            if (isEnabled) {
                replaceTextInNode(document.body); 
            } else {
                location.reload();
            }
        }
    }
});

// Live chat mutation observer
const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;

    for (const mutation of mutations) {
    if (mutation.type === 'childList') {
        for (const addedNode of mutation.addedNodes) {
            replaceTextInNode(addedNode);
        }
    } else if (mutation.type === 'characterData') {
        if (mutation.target.parentNode && !mutation.target.parentNode.isContentEditable) {
            replaceTextInNode(mutation.target);
        }
    }
  }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

