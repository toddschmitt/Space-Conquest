var messagesSelectors = {}
var currentMessageId;

function setupMessageSelectors() {
    messagesSelectors.commentHeader = byId("commentHeader");
    messagesSelectors.commentBodyText = byId("commentBodyText");
    messagesSelectors.prevMesssageButton = byId("prevMessageButton");
    messagesSelectors.nextMessageButton = byId("nextMessageButton");
}

function updateModalControls() {
    var message = messages.readMessage(currentPlayer, currentMessageId);
    messagesSelectors.commentHeader.innerHTML = message.header + " Turn:" + message.turn;
    messagesSelectors.commentBodyText.innerHTML = "<pre>" + message.body + "</pre>";

    if (messages.getNextMessageId(currentPlayer, currentMessageId) === undefined) {
        messagesSelectors.nextMessageButton.disabled = true;
    } else {
        messagesSelectors.nextMessageButton.disabled = false;
    }

    if (messages.getPreviousMessageId(currentPlayer, currentMessageId) === undefined) {
        messagesSelectors.prevMesssageButton.disabled = true;
    } else {
        messagesSelectors.prevMesssageButton.disabled = false;
    }
}

function onMessageModalOpen() {
    setupMessageSelectors();

    currentMessageId = messageCache.id;

    updateModalControls();

    messagesSelectors.prevMesssageButton.onclick = function () {
        currentMessageId = messages.getPreviousMessageId(currentPlayer, currentMessageId);
        updateModalControls();
    }

    messagesSelectors.nextMessageButton.onclick = function () {
        currentMessageId = messages.getNextMessageId(currentPlayer, currentMessageId);
        updateModalControls();
    }
}