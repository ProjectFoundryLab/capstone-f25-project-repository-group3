import { MessageSquare } from "lucide-react";
import { useState } from "react";
import WindowSection from "../components/WindowSection";

export default function SupportContent() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        asset: '',
        priority: 'Low',
        subject: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const createTodoistTask = async () => {
        const TODOIST_API_KEY = import.meta.env.VITE_TODOIST_KEY;
        const TODOIST_PROJECT_ID = import.meta.env.VITE_TODOIST_CAPSTONE_PROJECT_ID;

        if (!TODOIST_API_KEY || !TODOIST_PROJECT_ID) {
            throw new Error('Todoist credentials not configured');
        }

        const priorityMap = {
            'Low': 1,
            'Medium': 2,
            'High': 3
        };

        let taskContent = formData.subject;
        let taskDescription = formData.description;
        
        if (formData.asset) {
            taskDescription = `**Related Asset:** ${formData.asset}\n\n${formData.description}`;
        }

        const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TODOIST_API_KEY}`
            },
            body: JSON.stringify({
                content: taskContent,
                description: taskDescription,
                project_id: TODOIST_PROJECT_ID,
                priority: priorityMap[formData.priority] || 1,
                labels: ['support-ticket']
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create task');
        }

        return await response.json();
    };

    const handleSubmit = async () => {
        if (!formData.subject || !formData.description) {
            setMessage({ type: 'error', text: 'Subject and description are required' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await createTodoistTask();
            setMessage({ type: 'success', text: 'Ticket created successfully!' });
            setFormData({ asset: '', priority: 'Low', subject: '', description: '' });
        } catch (error) {
            console.error('Error creating ticket:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to create ticket. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <WindowSection title="Submit a new Ticket" icon={MessageSquare}>
            <div className="space-y-4">
                {message.text && (
                    <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message.text}
                    </div>
                )}
                
                <div>
                    <label htmlFor="asset" className="block text-sm font-medium text-gray-700">Related Asset (Optional)</label>
                    <input
                        type="text"
                        id="asset"
                        name="asset"
                        value={formData.asset}
                        onChange={handleChange}
                        placeholder="e.g., ASSET001 or SW002"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
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
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Briefly describe your issue"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please provide as much detail as possible..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    ></textarea>
                </div>
                
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </div>
        </WindowSection>
    );
}