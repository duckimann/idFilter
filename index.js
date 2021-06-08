let tabId,
    sourceFile = "source", // Source Filename
    navNext = () => {
        let textarea = document.querySelector("#idsInput").value,
            ids = (textarea.includes("\n")) ? textarea.split("\n").filter((asdf) => asdf) : [textarea],
            shiftedId = ids.shift(),
            urlParts = [
                /**
                * @param shiftedId The ID that is at the beginning of textarea, will be taken out every time you hit an action (Keep / Throw / Next)
                * ? You can order the output URL params by changing the order of this Array.
                * ? For Example, URL result for this Array: https://www.pixiv.net/member_illust.php?id=shiftedId
                */
                "https://www.pixiv.net/member_illust.php?id=", shiftedId
            ],
            navTo = urlParts.join(""),
            cId = document.querySelector("#cId"),
            f = new FormData();
        
        cId.innerHTML = `<br>IDs Left: ${ids.length}<br>Current ID:<br>${shiftedId}`;
        cId.setAttribute("currentID", shiftedId);
        document.querySelector("#idsInput").value = ids.join("\n");
        document.title = `ID Filter | Left: ${ids.length} | Current: ${shiftedId}`;

        f.append("filename", sourceFile);
        f.append("flags", "w");
        f.append("id", [shiftedId, ...ids].join("\n"));
        fetch("http://127.0.0.1/saver.php", {method: "POST", body: f});
        
        if (shiftedId) chrome.tabs.update(tabId, {url: navTo}); else chrome.tabs.remove(tabId);
    },
    takeAct = (act) => {
        let fileNames = [
            "pixiv_keep", // File Name to save shifted ID into if you hit "Keep"
            "pixiv_throw" // File Name to save shifted ID into if you hit "Throw"
        ], f = new FormData();
        f.append("id", document.querySelector("#cId").getAttribute("currentid"));
        f.append("flags", "a")
        f.append("filename", (act) ? fileNames[0] : fileNames[1]);
        fetch("http://127.0.0.1/saver.php", { // PHP file To save ID
            method: "POST",
            body: f
        }).then((a) => navNext());
    };
document.querySelector("#keep").onmouseup = () => takeAct(true);
document.querySelector("#throw").onmouseup = () => takeAct(false);
document.querySelector("#next").onmouseup = navNext;
document.onkeyup = ({key, ctrlKey}) => {
    if (!ctrlKey) switch(key) { // If Ctrl key is not pressed and release key below -> Action
        case "s": takeAct(true); break;
        case "d": takeAct(false); break;
        case "f": navNext(); break;
    };
};
// Tells background that dashboard ready => get viewer tab ID => Set to tabId
chrome.runtime.sendMessage("getTabId", (a) => {
    tabId = a;
    fetch(`${sourceFile}.txt`) // Get source file content after extension skeleton loaded
        .then((a) => a.text())
        .then((a) => {document.querySelector("#idsInput").value = a;navNext();});
});
// Take action on certain request
chrome.webRequest.onBeforeRequest.addListener((catches) => {
    console.log(catches);
    // if match url => inject script to popup
	if (/ajax\/user\/\d+\/profile\/all/.test(catches.url)) chrome.tabs.executeScript(catches.tabId, {code: `setTimeout(() => document.querySelector("ul._2WwRD0o._2WyzEUZ").scrollIntoView(), 1000)`});
}, {
	urls: ["<all_urls>"],
	types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
}, ["requestBody"]);