import React from "react";

interface ProgressBarProps {
    progress: number;
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
    return (
        <div className={className}>
            <div className="w-full h-[0.5rem] rounded-full bg-gray-200">
                <div
                    style={{ width: `${progress.toFixed(2)}%`, maxWidth: `100%` }}
                    className="bg-blue-500 h-[0.5rem] rounded-full"
                >
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;