import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/Store";
import { hideTaskForm } from "../redux/TaskSlice";
import { addNewTask, getTasksByPageIdAndStage } from "../service/TaskService";
import User from "../model/User";
import Task from "../model/Task";

const AddTaskForm: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { pageId, maker, members, type, visible } = useSelector((state: RootState) => state.task);
    const dispatch = useDispatch<AppDispatch>();

    const [name, setName] = useState('');
    const [assignee, setAssignee] = useState<User>();
    const [startDateTime, setStartDateTime] = useState('');
    const [targetDateTime, setTargetDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [notifiedMember, setNotifiedMember] = useState<string[]>([])

    const getCurrentDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const onClose = () => {
        setIsOpen(false);
        setInputValue('');
        setName('');
        setAssignee(undefined);
        setStartDateTime('');
        setTargetDateTime('');
        setEndDateTime('');
        setNotifiedMember([]);
        dispatch(hideTaskForm());
    };

    const handleSetAssignee = (id: string) => {
        const selectedMember = members.find((member) => member.Id === id);
        if (selectedMember) {
            setAssignee(selectedMember);
            setNotifiedMember([...notifiedMember, selectedMember.Id]);
        }
    };

    const handleSetNotifiedMember = (id: string) => {
        if (notifiedMember.includes(id)) {
            setNotifiedMember(notifiedMember.filter((memberId) => memberId !== id));
        } else {
            setNotifiedMember([...notifiedMember, id]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        const task: Task = {
            Page: pageId,
            Name: name,
            Assignee: assignee?.Id ?? '',
            Stage: 1,
            StartDateTime: new Date(startDateTime),
            TargetDateTime: new Date(targetDateTime),
            EndDateTime: new Date(endDateTime),
            EndedTime: null,
            NotifiedMembers: notifiedMember,
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        }
        await addNewTask(task);
        onClose();
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (maker) {
            setAssignee(maker);
        }

        setStartDateTime(getCurrentDateTime());
        document.addEventListener('keydown', handleEscape);

        return () => document.removeEventListener('keydown', handleEscape);
    }, [maker]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 mt-12 bg-black/50 flex items-center justify-center z-30">
            <div className="bg-white max-h-[80%] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all animate-fadeIn">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
                </div>

                <div className="overflow-y-auto h-[70vh]">
                    <form
                        className="px-6 py-2 mb-10"
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="input-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter task name..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="assignee-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Assignee
                                </label>
                                <select
                                    className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={assignee?.Id || ""}
                                    onChange={(e) => handleSetAssignee(e.target.value)}>
                                    <option value="" disabled>Select Assignee</option>
                                    {members.map((member) => (
                                        <option key={member.Id} value={member.Id}>
                                            {member.PhotoUrl && (
                                                <img
                                                    src={member.PhotoUrl}
                                                    className="rounded-full border-2 border-black h-10 w-10 ml-2"
                                                    alt={member.Name}
                                                />
                                            )}
                                            {member.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="start-datetime-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="start-datetime-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Target Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={targetDateTime}
                                    onChange={(e) => setTargetDateTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="start-datetime-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Deadline Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="start-datetime-field"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Notified Members
                                </label>
                                <select
                                    className="w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={notifiedMember}
                                    onChange={(e) => handleSetNotifiedMember(e.target.value)}
                                    multiple={true}
                                >
                                    {members.filter(member => member.Id != assignee?.Id).map((member) => (
                                        <option key={member.Id} value={member.Id}>
                                            {member.PhotoUrl && (
                                                <img
                                                    src={member.PhotoUrl}
                                                    className="rounded-full border-2 border-black h-10 w-10 ml-2"
                                                    alt={member.Name}
                                                />
                                            )}
                                            {member.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTaskForm;
