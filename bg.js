// Action on click to extention icon & close popup
// Shouldn't modify this part
let windowsId = [], tabId;
chrome.browserAction.onClicked.addListener((a) => {
    if (windowsId.length < 2) {
        chrome.windows.create({
            url: chrome.runtime.getURL("index.html"),
            state: "normal",
            type: "panel",
            width: 450,
            height: 700,
            focused: true
        }, (indexWD) => {
            windowsId.push(indexWD.id);
        });
        chrome.windows.create({
            url: "about:blank",
            state: "normal",
            type: "panel",
            width: 1450,
            height: 1000,
            left: 500,
            focused: true
        }, (curW) => {
            windowsId.push(curW.id);
            tabId = curW.tabs[0].id;
        });
    }
});
// Wait dashboard loaded
chrome.runtime.onMessage.addListener((msg, from, res) => {
    let msgs = {
        getTabId: () => res(tabId)
    };
    msgs[msg]();
});
// Act when dashboard or viewer get close
chrome.windows.onRemoved.addListener((a) => {
    if (windowsId.includes(a)) {
        windowsId.splice(windowsId.indexOf(a), 1);
        while (windowsId.length > 0) chrome.windows.remove(windowsId.shift());
    }
});