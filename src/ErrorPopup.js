import React from "react";

export function ErrorPopup(props) {
    return (
        <div id="error-popup">
            <span id="error-message">{props.message}</span>
        </div>
    );
}