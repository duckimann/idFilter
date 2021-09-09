class Tab {
    tabId = 0;
    curUrl = "";
    curId = "";

    constructor(tabId) {
        this.tabId = tabId;
    }

    closeTab() {
        chrome.tabs.remove(this.tabId);
    }

    updateUrl() {
        chrome.tabs.update(this.tabId, { url: this.curUrl });
    }

    updateUrlFromId() {
        this.curUrl = `https://www.pixiv.net/en/users/${this.curId}/artworks`;
        this.updateUrl();
    }
}

function sendSave(fileName, flags, content) {
    let f = new FormData();
    f.append("filename", fileName);
    f.append("flags", flags);
    f.append("id", content);
    return fetch("http://127.0.0.1:99/saver.php", {
        method: "POST",
        body: f
    });
}

// Tells background that dashboard ready => get viewer tab ID => Set to tabId
chrome.runtime.sendMessage("getTabId", (a) => {
    window.CurrentView = new Tab(a);
    fetch(`source.txt`) // Get source file content after extension skeleton loaded
        .then((res) => res.text())
        .then((res) => {
            document.querySelector("#idsInput").value = res;
            navNext();
        });
});

let navNext = () => {
        let textarea = document.querySelector("#idsInput").value,
            ids = (textarea.includes("\n")) ? textarea.split("\n").filter((asdf) => asdf) : [textarea],
            shiftedId = ids.shift(),
            cId = document.querySelector("#cId");
        
        CurrentView.curId = shiftedId;
        cId.innerHTML = `IDs Left: ${ids.length}<br>Current ID:<br>${shiftedId}`;
        document.querySelector("#idsInput").value = ids.join("\n");
        document.title = `ID Filter | Left: ${ids.length} | Current: ${shiftedId}`;

        sendSave("source", "w", [shiftedId, ...ids].join("\n"));
        
        if (shiftedId) CurrentView.updateUrlFromId(); else CurrentView.closeTab();
    },
    takeAct = (act) => {
        let fileNames = [
            "pixiv_keep", // File Name to save shifted ID into if you hit "Keep"
            "pixiv_throw" // File Name to save shifted ID into if you hit "Throw"
        ];
        sendSave((act) ? fileNames[0] : fileNames[1], "a", CurrentView.curId).then((a) => navNext());
    };
document.querySelector("#keep").onmouseup = () => takeAct(true);
document.querySelector("#throw").onmouseup = () => takeAct(false);
document.querySelector("#next").onmouseup = navNext;
document.querySelector("#reload").onmouseup = () => CurrentView.updateUrlFromId();
document.onkeyup = ({key, ctrlKey}) => {
    if (!ctrlKey) switch(key) { // If Ctrl key is not pressed and release key below -> Action
        case "s": takeAct(true); break;
        case "d": takeAct(false); break;
        case "f": navNext(); break;
        case "r": CurrentView.updateUrlFromId(); break;
    };
};

// Take action on certain request
chrome.webRequest.onBeforeRequest.addListener((catches) => {
    console.log(catches);
    // if match url => inject script to popup
    if (/ajax\/user\/\d+\/profile\/all/.test(catches.url)) chrome.tabs.executeScript(catches.tabId, {code: `setTimeout(() => document.querySelector("section > div > div > ul").scrollIntoView(), 1000)`});
}, {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
}, ["requestBody"]);