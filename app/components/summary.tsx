import React from "react";
import ScoreGauge from "./ScoreGage";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
    const getColorClass = () => {
        if (score >= 80) return "text-green-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    }
    return <div className="resume-summary">
        <div className="category">
            <div className="flex flex-row gap-2 items-center justify-center">
                <p className="text-2xl">{title}</p>
                <ScoreBadge score={score} />
            </div>
            <p className="text-2xl">
                <span className={getColorClass()}>{score}</span>
            </p>
        </div>
    </div>
}

export default function Summary({feedback}: {feedback: Feedback | null}) {
    return <div className="bg-white rounded-2xl shadow-md w-full">
        <div className="flex flex-row items-center p-4 gap-8">
            <ScoreGauge score={feedback?.overallScore || 0} />
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold">Overall Score</h3>
                <p className="text-gray-600">These score is calculated based on the variables listed below.</p>
            </div>
        </div>
        <Category title="Tone & Style" score={feedback?.toneAndStyle.score || 0} />
        <Category title="Content" score={feedback?.content.score || 0} />
        <Category title="Structure" score={feedback?.structure.score || 0} />
        <Category title="Skills" score={feedback?.skills.score || 0} />

    </div>;
}
