import React from "react";

export function DeleteConfirmation(props) {
    return (
        <div>
            {(props.type === "account") && (<span>Are you sure you want to delete your account?</span>)}
            {(props.type === "post") && (<span>Are you sure you want to delete this post?</span>)}
            {(props.type === "comment") && (<span>Are you sure you want to delete your comment?</span>)}
            <button onClick={props.onConfirm}>Confirm</button>
            <button onClick={props.onCancel}>Cancel</button>
        </div>
    );
}