import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, ChevronDown, QrCode, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Ribbon() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
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

    const onScanClick = () => {
        setShowScanner(true);
    };

    const closeScanner = () => {
        setShowScanner(false);
        setScanResult("");
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
        if (showScanner && scannerRef.current && !html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("qr-reader");

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCodeRef.current
                .start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        setScanResult(decodedText);
                        console.log("QR Code scanned:", decodedText);
                    },
                    (errorMessage) => {
                        // Handle scan errors silently
                    }
                )
                .catch((err) => {
                    console.error("Unable to start scanning", err);
                });
        }

        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current
                    .stop()
                    .then(() => {
                        html5QrCodeRef.current.clear();
                        html5QrCodeRef.current = null;
                    })
                    .catch((err) => {
                        console.error("Error stopping scanner", err);
                    });
            }
        };
    }, [showScanner]);

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
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search assets, users, licenses..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <Button variant="secondary" icon={QrCode} onClick={onScanClick}>
                        Scan Asset
                    </Button>
                    <Bell className="text-gray-500 w-6 h-6 hover:text-gray-800 cursor-pointer" />
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

            {showScanner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Scan QR Code</h2>
                            <button
                                onClick={closeScanner}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div
                            id="qr-reader"
                            ref={scannerRef}
                            className="w-full rounded-lg overflow-hidden"
                        ></div>
                        {scanResult && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-800">Scanned Result:</p>
                                <p className="text-sm text-green-700 mt-1 break-all">{scanResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}