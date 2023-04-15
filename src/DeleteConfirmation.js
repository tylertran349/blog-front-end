import React from "react";

export function DeleteConfirmation(props) {
    return (
        <div id="delete-confirmation-popup">
            {(props.type === "account") && (<span>Are you sure you want to delete your account?</span>)}
            {(props.type === "post") && (<span>Are you sure you want to delete this post?</span>)}
            {(props.type === "comment") && (<span>Are you sure you want to delete your comment?</span>)}
            <div id="buttons">
                <button onClick={props.onConfirm} id="warning-button">Confirm</button>
                <button onClick={props.onCancel}>Cancel</button>
            </div>
        </div>
    );
}