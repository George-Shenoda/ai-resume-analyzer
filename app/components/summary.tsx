import React from "react";

export default function Summary({feedback}: {feedback: Feedback | null}) {
    return <div>summary
        {JSON.stringify(feedback)}
    </div>;
}
