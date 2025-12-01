import { useState, useEffect, useRef } from "react";
import { User, ChevronDown } from "lucide-react";
import Button from "./Button";
import QRScanner from "./QRScanner";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Ribbon() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const profileRef = useRef(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/auth');
        } catch (err) {
            console.error('Error signing out:', err?.message ?? err);
            // redirect to auth even if there's an error
            navigate('/auth');
        }
    };

    useEffect(() => {
        const fetchDisplayName = async () => {
            if (user?.id) {
                try {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("display_name")
                        .eq("id", user.id)
                        .single();

                    if (error) {
                        console.error("Error fetching display name:", error);
                        setDisplayName(user.email || "User");
                    } else if (data) {
                        setDisplayName(data.display_name || user.email || "User");
                    }
                } catch (err) {
                    console.error("Error:", err);
                    setDisplayName(user.email || "User");
                }
            }
        };

        fetchDisplayName();
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            {/* Mobile and Tablet View: Only QR Scanner - Full Screen */}
            <div className="lg:hidden w-full h-screen bg-white flex items-center justify-center">
                <QRScanner />
            </div>

            {/* Desktop View: Normal Header with QR Scanner and Profile */}
            <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-gray-200 p-4 justify-end items-center">
                <div className="flex items-center space-x-4">
                    <QRScanner />
                    <div className="relative" ref={profileRef}>
                        <div
                            className="flex items-center space-x-2 cursor-pointer"
                            onClick={() => setShowProfileDropdown((s) => !s)}
                            role="button"
                            tabIndex={0}
                        >
                            <User className="text-gray-500 w-6 h-6 rounded-full bg-gray-200 p-1" />
                            <span className="text-sm font-medium">{displayName || "User"}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>

                        {showProfileDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        handleSignOut();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}