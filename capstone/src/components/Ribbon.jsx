import { Search, Bell, User, ChevronDown, QrCode } from "lucide-react";
import Button from "./Button";

export default function Ribbon() {
    const onScanClick = () => {
        console.log("I'm clicked!!!")
    }


    return (
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search assets, users, licenses..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="secondary" icon={QrCode} onClick={onScanClick}>Scan Asset</Button>
                <Bell className="text-gray-500 w-6 h-6 hover:text-gray-800 cursor-pointer" />
                <div className="flex items-center space-x-2 cursor-pointer">
                    <User className="text-gray-500 w-6 h-6 rounded-full bg-gray-200 p-1" />
                    <span className="text-sm font-medium">Admin User</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
            </div>
        </header>
    );
}