import React from "react";

function ATS({
    score,
    details,
}: {
    score: number;
    details: {type: "good" | "improve", tip: string}[];
}) {
    return <div>ATS
        {JSON.stringify({score, details})}
    </div>;
}

export default ATS;
