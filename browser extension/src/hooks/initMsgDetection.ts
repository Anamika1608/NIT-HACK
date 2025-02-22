import { debounce } from 'lodash';
import type { PlasmoCSConfig } from "plasmo";
import { sendToBackground } from "@plasmohq/messaging";
import { getToken } from "~utils/auth";
import handleHideUser from './hideUser';
import { handleHidingUserOnReload } from './hideUserOnReload';

import { generateUniqueIdForInbox } from "../hooks/generateUniqueId/inboxChat"
import { generateUniqueIdForPreview } from "../hooks/generateUniqueId/previewChat"
import { useEffect } from 'react';


// import { tabs } from "@plasmohq/chrome-apis"
// import { updatePreviewUI } from './updateMsgUi/previewChat';

export const config: PlasmoCSConfig = {
    matches: ["https://www.linkedin.com/*", "https://www.instagram.com/*"]
};

let areMessagesHidden = true
let foundLastProcessedMsg = false;

import { abusiveWordsSet } from '~keywords/linkedin_inappropriate_keywords_variations';




const toggleMessages = () => {
    const chatPreviews = document.querySelectorAll(
        ".msg-s-event-listitem__body"
    );

    const showMessagesBtn = document.getElementById("show-messages-btn");
    areMessagesHidden = !areMessagesHidden;

    chatPreviews.forEach((preview) => {
        const messageContainer = preview as HTMLElement;
        const originalMessage = messageContainer.getAttribute('data-original-message');

        if (originalMessage != null) {
            messageContainer.classList.add('message-processed');

            if (!areMessagesHidden) {
                console.log("Showing original message:", originalMessage);
                const newContent = document.createElement('div');
                newContent.innerHTML = `<i style="color: black; padding: 8px">${originalMessage}</i>`;

                messageContainer.textContent = '';
                messageContainer.appendChild(newContent);
                messageContainer.style.border = "3px dashed orange";
            } else {
                console.log("Showing warning message");
                const warningContent = document.createElement('div');
                warningContent.innerHTML = '<i style="color: red; padding: 8px">Harassment detected in this message</i>';

                messageContainer.textContent = '';
                messageContainer.appendChild(warningContent);
                messageContainer.style.border = "3px dashed red";
            }
        }
    });

    if (showMessagesBtn) {
        showMessagesBtn.innerText = areMessagesHidden ? "Show Messages" : "Hide Messages";
    }
}

const extractProfileUrl = () => {
    const titleBar = document.querySelector('.msg-title-bar__title-bar-title');
    if (!titleBar) return null;

    const profileLink = titleBar.querySelector('.msg-thread__link-to-profile');
    return profileLink?.getAttribute('href') || null;
};

const extractUsername = () => {
    const titleBar = document.querySelector('.msg-title-bar__title-bar-title');
    if (!titleBar) return null;
    const profileLink = titleBar.querySelector('.msg-thread__link-to-profile');
    const title = profileLink?.getAttribute('title') || null;
    const name = title.split("Open ")[1].split("’s profile")[0];
    return name;
};


const extractProfilePicUrl = () => {
    const harassmentWarning = document.getElementById('harassment-warning');
    const messageListContainer = harassmentWarning.closest('.msg-s-message-list-container');
    const parentContainer = messageListContainer.parentElement;
    const msgTitleBar = parentContainer.querySelector('.msg-title-bar');
    const profileLink = msgTitleBar.querySelector<HTMLAnchorElement>('a.msg-thread__link-to-profile');

    // Extract profile details
    const title = profileLink.title;
    const name = title.split("Open ")[1].split("’s profile")[0];
    const profileUrl = profileLink.href;

    const activeChat = document.querySelector('.msg-conversations-container__convo-item-link--active');
    const profilePicElement = activeChat?.querySelector('.presence-entity__image') as HTMLImageElement;
    console.log("profilePicElement", profilePicElement)
    const profilePicUrl = profilePicElement.src
    return profilePicUrl;
}

// Cache to store recently processed messages 
let currentChatId: string | null = null;
const processedInboxIds = new Set<string>();
const processedMessageIds = new Set<string>();
const MESSAGE_CACHE_LIMIT = 1000;

const injectShowButton = (userDecodedId: string | null) => {
    const profileHeader = document.querySelector(
        ".msg-s-message-list__typing-indicator-container--without-seen-receipt"
    );

    if (profileHeader && !document.getElementById("harassment-warning")) {
        const warningDiv = document.createElement("div");
        warningDiv.id = "harassment-warning";
        warningDiv.classList.add("harassment-warning-style");

        const warningText = document.createElement("span");
        warningText.innerText = "⚠️ Our AI has detected harassment messages in this conversation. The messages are hidden for your safety.";
        warningText.classList.add("warning-text-style");

        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("buttons-container");

        const showMessagesBtn = document.createElement("button");
        showMessagesBtn.id = "show-messages-btn";
        showMessagesBtn.innerText = "Show Messages";
        showMessagesBtn.classList.add("show-messages-btn-style");
        showMessagesBtn.onclick = toggleMessages;

        // Create loader element
        const loader = document.createElement("div");
        loader.id = "report-loader";
        loader.classList.add("loader-style");
        loader.style.display = "none";

        const generateReportBtn = document.createElement("button");
        generateReportBtn.id = "generate-report-btn";
        generateReportBtn.innerText = "Legal Report";
        generateReportBtn.classList.add("generate-report-btn-style");

        if (!userDecodedId) {
            generateReportBtn.disabled = true;
            generateReportBtn.classList.add("disabled-button");
            generateReportBtn.title = "User ID required for this action";
            generateReportBtn.style.cursor = "not-allowed";
        } else {
            generateReportBtn.onclick = async () => {
                // Show loader and disable button
                loader.style.display = "block";
                generateReportBtn.disabled = true;
                generateReportBtn.innerText = "Generating...";

                try {
                    const res = await sendToBackground({
                        name: "generateReport",
                        body: {
                            profileUrl: extractProfileUrl(),
                            profilePicUrl: extractProfilePicUrl(),
                            username: extractUsername(),
                            platform: "linkedIn",
                        }
                    });

                    const response = await sendToBackground({
                        name: "downloadReport",
                        body: {
                            reportId: res.data.reportId
                        }
                    });

                    // Convert base64 to binary
                    const binaryString = atob(response.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Create blob from binary data
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);

                    // Open in new tab
                    window.open(url, '_blank');

                    // Clean up
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error("Error:", error);
                } finally {
                    loader.style.display = "none";
                    generateReportBtn.disabled = false;
                    generateReportBtn.innerText = "Generate Report";
                }
            };
        }

        const hideUserBtn = document.createElement("button");
        hideUserBtn.id = "hide-user-btn";
        hideUserBtn.innerText = "Hide User";
        hideUserBtn.classList.add("hide-user-btn-style");

        if (!userDecodedId) {
            hideUserBtn.disabled = true;
            hideUserBtn.classList.add("disabled-button");
            hideUserBtn.title = "User ID required for this action";
            hideUserBtn.style.cursor = "not-allowed";
        } else {
            hideUserBtn.onclick = () => handleHideUser();
        }

        buttonsContainer.appendChild(showMessagesBtn);
        buttonsContainer.appendChild(generateReportBtn);
        buttonsContainer.appendChild(hideUserBtn);

        warningDiv.appendChild(warningText);
        warningDiv.appendChild(buttonsContainer);
        warningDiv.appendChild(loader); // Add loader to the warning div

        profileHeader.appendChild(warningDiv);

        // Add CSS for loader and disabled state
        const style = document.createElement('style');
        style.textContent = `
            .disabled-button {
                opacity: 0.6;
                position: relative;
            }
            
            .loader-style {
                width: 24px;
                height: 24px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 10px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

const removeWarningBanner = () => {
    const warningDiv = document.getElementById("harassment-warning");
    if (warningDiv) {
        warningDiv.remove();
    }
};

// Clean message content
const cleanMessage = (element: Element, isPreview: boolean): string => {
    let rawMessage;

    if (isPreview) {
        console.log("msg element got in cleanmsg", element);

        // Locate the nearest `.msg-conversation-card__message-snippet`
        const requiredMsgElement = element.querySelector(".msg-conversation-card__message-snippet");
        console.log("requiredMsgElement", requiredMsgElement);

        if (!requiredMsgElement) {
            return "";
        }

        rawMessage = requiredMsgElement.textContent || "";
        console.log("raw msg in preview", rawMessage);

        return rawMessage.trim();
    } else {
        rawMessage = element.innerHTML || "";
        console.log("main msg", rawMessage);

        const temp = document.createElement("div");
        temp.innerHTML = rawMessage;
        const text = temp.textContent || temp.innerText || "";

        return text.trim();
    }
};



// Handle inbox message UI updates
const updateInboxUI = async (element: HTMLElement, message: string, userDecodedId: string) => {
    // element.classList.add('message-processed');
    element.setAttribute('data-original-message', message);

    const warningContent = document.createElement('div');
    warningContent.innerHTML = '<i style="color: red; padding: 8px">Harassment detected in this message</i>';
    element.textContent = '';
    element.appendChild(warningContent);
    element.style.border = "3px dashed red";

    injectShowButton(userDecodedId);

};


// Extract message metadata
const extractMessageMetadata = (element: Element) => {
    try {
        // Get all the elements synchronously
        const mainContainer = element.closest('.msg-s-event-listitem');
        if (!mainContainer) {
            console.log("Main container not found");
            return null;
        }

        const metaDiv = mainContainer.querySelector('.msg-s-message-group__meta');
        if (!metaDiv) {
            console.log("Meta div not found");
            return null;
        }

        const profileLink = metaDiv.querySelector('a[data-test-app-aware-link]');
        const nameElement = metaDiv.querySelector('.msg-s-message-group__name');
        const timeElement = metaDiv.querySelector('.msg-s-message-group__timestamp');

        // console.log("profileLink", profileLink);
        // console.log("timeelement", timeElement);

        // Return the metadata object
        return {
            profileUrl: profileLink?.href || 'URL not found',
            userName: nameElement?.textContent?.trim() || 'Name not found',
            timeOfMessage: timeElement?.textContent?.trim() || 'Time not found'
        };
    } catch (error) {
        console.error("Error extracting metadata:", error);
        return null;
    }
};


// Generate message ID
const generateMessageId = (element: Element, isPreview: boolean): string => {
    // console.log("element in gen msg id", element)
    return (isPreview) ? generateUniqueIdForPreview(element) : generateUniqueIdForInbox(element);

};





// Check if message is after last processed timestamp
const isMessageAfterLastProcessed = async (
    userDecodedId: string,
    profileUrl: string,
    messageId: string
): Promise<boolean> => {
    const lastProcessed = await sendToBackground({
        name: "getLastMsgId",
        body: { userDecodedId, profileId: profileUrl.replace('https://www.linkedin.com/in/', '').split('/')[0], }
    });

    if (!lastProcessed?.messageId) {
        return true; // No last processed message, means we should process everything
    }

    return messageId === lastProcessed.messageId; // Return true if we hit the benchmark message
};

const containsAbusiveWords = (message) => {
    // console.log("i am in set detection function");
    // Split message into words, keeping original case and characters
    const words = message.split(/\s+/);

    // Check original words against the set (case-insensitive)
    return words.some(word => {
        // console.log("word", word)
        // Only check the word if it's not empty
        if (word.length > 0) {
            // Convert to lowercase only for comparison
            const lowercaseWord = word.toLowerCase();
            const ans = abusiveWordsSet.has(lowercaseWord);
            // console.log(`set result for ${word} - ${ans}`)
            return ans;
        }
        return false;
    });
}

const updatePreviewUI = (element: HTMLElement) => {
    element.innerHTML = '<i style="color: red;">Harassment detected in last message</i>';
    element.classList.add('message-processed');
};


const processMessage = async (element: Element, isPreview: boolean, userDecodedId: string | null) => {

    // console.log("inside processMessage handler");
    const messageId = await generateMessageId(element, isPreview);
    // console.log("msg id in processMsg", messageId)
    const profileUrl = extractProfileUrl();
    let isNewUser = false;
    // console.log("processedMessageIds", processedMessageIds);
    // console.log("processedInboxIds", processedInboxIds)



    // console.log('raw msg',rawMessage)
    const cleanedMessage = cleanMessage(element, isPreview);
    // console.log("cleaned message -> ", cleanedMessage);

    if (!cleanedMessage) return;
    if (element.classList.contains('message-processed')) {
        return;
    }

    if (processedMessageIds.has(messageId) || processedInboxIds.has(messageId)) return

    try {
        console.log("here for msg id", messageId)
        element.classList.add('message-processed');
        (isPreview) ? processedInboxIds.add(messageId) : processedMessageIds.add(messageId);

        // check from the array first - if any word from senetence is from array 
        if (containsAbusiveWords(cleanedMessage)) {
            console.log("isPreview", isPreview);
            if (isPreview) {
                console.log("in update preview ui");
                updatePreviewUI(element as HTMLElement);
            } else {
                await updateInboxUI(element as HTMLElement, cleanedMessage, userDecodedId);
            }

            return;
        }


        if (userDecodedId != null) {
            const upstashResult = await sendToBackground({
                name: "checkHarassmentMsgId",
                body: { messageId, userDecodedId, profileId: profileUrl.replace('https://www.linkedin.com/in/', '').split('/')[0], }
            });





            if (upstashResult.isNewUser) {
                isNewUser = true;
            } else if (upstashResult.found === 1) {
                if (isPreview) {
                    updatePreviewUI(element as HTMLElement);

                } else {
                    await updateInboxUI(element as HTMLElement, cleanedMessage, userDecodedId);
                }
                element.classList.add('message-processed');
                processedMessageIds.add(messageId);
                return;
            }
        }


        // if (!foundLastProcessedMsg) {
        //     foundLastProcessedMsg = await isMessageAfterLastProcessed(userDecodedId, profileUrl, messageId);
        //     console.log(`now it has become ${foundLastProcessedMsg} for msg id ${messageId}`)
        // }

        // console.log("foundLastProcessedMsg", foundLastProcessedMsg)

        if (userDecodedId == null || isNewUser) {
            console.log("in main logic - sending to AI");
            const apiResult = await sendToBackground({
                name: "detectMsg",
                body: { message: cleanedMessage }
            });

            console.log(`api result for ${cleanedMessage} `, apiResult.data);

            if (apiResult.data) {

                console.log("ispreview", isPreview)
                if (isPreview) {
                    console.log("before calling the updatePreviewUI")
                    updatePreviewUI(element as HTMLElement);
                } else {
                    console.log("updating for", cleanedMessage);
                    // await updateInboxUI(element as HTMLElement, cleanedMessage, userDecodedId);

                    if (userDecodedId != null) {

                        console.log("before saving to DB");

                        const metadata = await extractMessageMetadata(element);
                        console.log("msg meta data", metadata)

                        if (!metadata) {
                            console.error("Failed to extract message metadata");
                            return;
                        }

                        await sendToBackground({
                            name: "saveMsgToDB",
                            body: {
                                hiddenBy: userDecodedId,
                                profileUrl: metadata.profileUrl,
                                userName: metadata.userName,
                                messageContent: cleanedMessage,
                                timeOfMessage: metadata.timeOfMessage,
                                platform: "linkedIn"
                            }
                        });

                        await sendToBackground({
                            name: "updateLastMsgId",
                            body: {
                                userDecodedId,
                                profileId: profileUrl.replace('https://www.linkedin.com/in/', '').split('/')[0],
                                messageId
                            }
                        });
                    }
                }

                if (userDecodedId != null) {
                    await sendToBackground({
                        name: "saveHarassmentMsgId",
                        body: {
                            userDecodedId,
                            messageId,
                            profileId: profileUrl.replace('https://www.linkedin.com/in/', '').split('/')[0],
                        }
                    });




                }
            }
        }

        // processedMessageIds.add(messageId);
        // element.classList.add('message-processed');


    } catch (error) {
        console.error("Error processing message:", error);
    }
};


const extractChatId = (url: string): string | null => {
    const match = url.match(/messaging\/thread\/(.*?)(?:\/|$)/);
    return match ? match[1] : null;
};

const resetProcessedMessages = () => {
    processedMessageIds.clear();
    removeWarningBanner();

    // // Reset message styling
    // document.querySelectorAll(".msg-s-event-listitem__body, .msg-conversation-card__content--selectable").forEach(element => {
    //     if (element instanceof HTMLElement) {
    //         element.style.border = "none";
    //         element.classList.remove('message-processed');
    //         const originalMessage = element.getAttribute('data-original-message');
    //         if (originalMessage) {
    //             element.removeAttribute('data-original-message');
    //             element.innerHTML = originalMessage;
    //         }
    //     }
    // });
};

const createProcessMessages = (userDecodedId: string | null) => {
    return debounce(() => {
        if (window.location.href.includes("/messaging")) {
            foundLastProcessedMsg = false;

            document.querySelectorAll(".msg-conversation-card__message-snippet-container:not(.message-processed)")
                .forEach(element => processMessage(element as HTMLElement, true, userDecodedId));

            document.querySelectorAll(".msg-s-event-listitem__body:not(.message-processed)")
                .forEach(element => processMessage(element as HTMLElement, false, userDecodedId));

        }
    }, 500);
};

export const initMessageDetection = (userDecodedId: string | null) => {
    let currentChatId: string | null = null;
    let areMessagesHidden = true;
    let foundLastProcessedMsg = false;
    const processedInboxIds = new Set<string>();
    const processedMessageIds = new Set<string>();
    const MESSAGE_CACHE_LIMIT = 1000;

    const processMessages = createProcessMessages(userDecodedId);

    // Initial processing
    processMessages();

    // Set up URL change detection using the History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        processMessages();
    };

    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        processMessages();
    };

    window.addEventListener('popstate', () => {
        processMessages();
    });

    // Set up DOM observer
    const observer = new MutationObserver(() => {
        if (window.location.href.includes("/messaging")) {
            const newChatId = extractChatId(window.location.href);
            if (newChatId !== currentChatId) {
                currentChatId = newChatId;
                resetProcessedMessages();
            }
        }
        processMessages();
        handleHidingUserOnReload();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Rest of your existing functions here...
    // (toggleMessages, extractProfileUrl, etc.)

    return () => {
        observer.disconnect();
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
        removeWarningBanner();
    };
};

const cleanupCache = () => {
    if (processedMessageIds.size > MESSAGE_CACHE_LIMIT) {
        const messageArray = Array.from(processedMessageIds);
        processedMessageIds.clear();
        messageArray.slice(-MESSAGE_CACHE_LIMIT).forEach(id => processedMessageIds.add(id));
    }
};

setInterval(cleanupCache, 5 * 60 * 1000); // Clean every 5 minutes if needed

