"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWebsocketConnectionRetryTimeout = exports.initializeWebsockets = void 0;
const Constants_1 = require("./Constants");
const Util_1 = require("./Util");
const authenticated_plugin_user_1 = require("./message_handlers/authenticated_plugin_user");
const integration_connection_1 = require("./message_handlers/integration_connection");
const FileManager_1 = require("./managers/FileManager");
const WebSocket = require("ws");
let retryTimeout = undefined;
let maxRetries = 20;
let retryCount = 0;
function initializeWebsockets() {
    const jwt = FileManager_1.getItem("jwt");
    if (!jwt) {
        // try again later
        setTimeout(() => {
            initializeWebsockets();
        }, 1000 * 60);
        return;
    }
    const options = {
        headers: {
            Authorization: FileManager_1.getItem("jwt"),
            "X-SWDC-Plugin-Id": Util_1.getPluginId(),
            "X-SWDC-Plugin-Name": Util_1.getPluginName(),
            "X-SWDC-Plugin-Version": Util_1.getVersion(),
            "X-SWDC-Plugin-OS": Util_1.getOs(),
            "X-SWDC-Plugin-TZ": Intl.DateTimeFormat().resolvedOptions().timeZone,
            "X-SWDC-Plugin-Offset": Util_1.getOffsetSeconds() / 60,
            "X-SWDC-Plugin-UUID": FileManager_1.getPluginUuid(),
        },
    };
    const ws = new WebSocket(Constants_1.websockets_url, options);
    ws.on("open", function open() {
        console.debug("[MusicTime] websockets connection open");
    });
    ws.on("message", function incoming(data) {
        handleIncomingMessage(data);
    });
    ws.on("close", function close(code, reason) {
        console.debug("[MusicTime] websockets connection closed");
        retryConnection();
    });
    ws.on("unexpected-response", function unexpectedResponse(request, response) {
        console.debug("[MusicTime] unexpected websockets response:", response.statusCode);
        if (response.statusCode === 426) {
            console.error("[MusicTime] websockets request had invalid headers. Are you behind a proxy?");
        }
        else {
            retryConnection();
        }
    });
    ws.on("error", function error(e) {
        console.error("[MusicTime] error connecting to websockets", e);
    });
}
exports.initializeWebsockets = initializeWebsockets;
function retryConnection() {
    if (retryCount > maxRetries) {
        return;
    }
    retryCount++;
    console.debug("[MusicTime] retrying websockets connecting in 10 seconds");
    retryTimeout = setTimeout(() => {
        console.log("[MusicTime] attempting to reinitialize websockets connection");
        initializeWebsockets();
    }, 10000);
}
function clearWebsocketConnectionRetryTimeout() {
    clearTimeout(retryTimeout);
}
exports.clearWebsocketConnectionRetryTimeout = clearWebsocketConnectionRetryTimeout;
const handleIncomingMessage = (data) => {
    try {
        const message = JSON.parse(data);
        console.info(`[MusicTime] received '${message.type}' websocket event`);
        switch (message.type) {
            case "info":
                console.info(`[MusicTime] ${message.body}`);
                break;
            case "authenticated_plugin_user":
                authenticated_plugin_user_1.handleAuthenticatedPluginUser(message.body);
                break;
            case "user_integration_connection":
                integration_connection_1.handleIntegrationConnectionSocketEvent(message.body);
                break;
            default:
                console.warn("[MusicTime] received unhandled websocket message type", data);
        }
    }
    catch (e) {
        console.error("[MusicTime] Unable to handle incoming message", data);
    }
};
//# sourceMappingURL=websockets.js.map