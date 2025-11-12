import { MessageSquare, Send } from "lucide-react";
import WindowSection from "../components/WindowSection";
import Button from "../components/Button";

export default function SupportContent() {
    return (
        <WindowSection title="Submit a new Ticket" icon={MessageSquare}>
            <form action="" className="space-y-4">
                <div>
                    <label htmlFor="asset" className="block text-sm font-medium text-gray-700">Related Asset (Optional)</label>
                    <input
                        type="text"
                        id="asset"
                        placeholder="e.g., ASSET001 or SW002"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        id="priority"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
                    <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        id="subject"
                        placeholder="Briefly describe your issue"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        rows="4"
                        placeholder="Please provide as much detail as possible..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    ></textarea>
                </div>
                <button className="w-full bg-blue-600 text-white p-2 rounded-md">Submit Ticket</button>
            </form>
        </WindowSection>
    )
}