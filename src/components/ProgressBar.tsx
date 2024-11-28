import { useState, useEffect } from "react";

interface ProgressBarProps {
    startDateTime: number;
    targetDateTime: number;
    endDateTime: number;
    // progress: number;
    className?: string;
    endedTime?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ startDateTime, targetDateTime, endDateTime, className, endedTime }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState('');
    const formattedTargetTime = `${new Date(targetDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(targetDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const formattedStartTime = `${new Date(startDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(startDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const formattedEndTime = `${new Date(endDateTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date(endDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        const progressPercentage = ((currentTime.getTime() - startDateTime) / (endDateTime - startDateTime)) * 100;

        const elapsedTime = (endedTime ? endedTime : currentTime.getTime()) - startDateTime;
        const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((elapsedTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const elapsedTimeString = `${days < 1 ? '' : days + 'd '}${hours}h ${minutes}m`;

        setProgress(progressPercentage);
        setElapsedTime(elapsedTimeString);

    }, [currentTime, startDateTime, endDateTime]);

    const spanClass = "text-xs"

    return (
        <div className={className}>

            {/* Start and End word */}
            <div className="flex justify-between text-sm text-gray-600 mb-1">
                <div className="relative group">
                    <span className={`absolute bottom-0 text-xs text-slate-700 transition-opacity duration-200 ease-in-out group-hover:opacity-0`}>
                        Start
                    </span>
                    <span className={`text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out '`}>
                        {formattedStartTime}
                    </span>
                </div>
                <span className={spanClass}></span>
                <div className="relative group">
                    <span className={`absolute bottom-0 right-0 text-xs text-slate-700 transition-opacity duration-200 ease-in-out group-hover:opacity-0`}>
                        End
                    </span>
                    <span className={`text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out '`}>
                        {formattedEndTime}
                    </span>
                </div>
            </div>

            {/* Marker Target Date Time */}
            <div className="w-full h-[0.5rem] bg-gray-200 relative flex items-center rounded-full">
                <div
                    style={{
                        marginLeft: `${Math.min(((targetDateTime - startDateTime) / (endDateTime - startDateTime)) * 100, 100)}%`,
                    }}
                    className="absolute group z-20"
                >
                    <div
                        className="absolute w-[7rem] z-30 -bottom-10 left-1 -translate-x-1/4 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {'Target: ' + formattedTargetTime}
                    </div>
                    <div className="bg-gray-500 h-[0.7rem] w-[0.2rem]"></div>
                </div>

                {/* Ongoing progress bar */}
                <div className="relative w-full">
                    <div
                        style={{
                            width: `${progress.toFixed(2)}%`,
                            maxWidth: `100%`,
                        }}
                        className="group bg-blue-500 h-[0.5rem] rounded-full relative"
                    >
                    </div>
                </div>
            </div>
            <span className="text-sm">Elapsed: {elapsedTime}</span>
        </div >
    );
};

export default ProgressBar;