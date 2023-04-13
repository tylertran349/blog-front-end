import React from "react";

export function ErrorPopup(props) {
    return (
        <div id="error-popup">
            <span class="material-symbols-outlined" id="warning-icon">warning</span>
            <span id="error-message">{props.message}</span>
            <button class="material-symbols-outlined" id="hide-error-button" onClick={props.onClick}>close</button>
        </div>
    );
}