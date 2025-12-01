import { useState, useEffect, useRef } from "react";
import { User, ChevronDown, QrCode, X } from "lucide-react";
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
    const [scanData, setScanData] = useState(null);
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
        setScanData(null);
    };

    // Start the scanner. Extracted so we can restart scanning after a successful read.
    const startScanner = async () => {
        if (!scannerRef.current) return;

        // If an instance exists, make sure it's stopped and cleared first
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.error("Error stopping existing scanner before restart", err);
            }
            html5QrCodeRef.current = null;
        }

        html5QrCodeRef.current = new Html5Qrcode("qr-reader");

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCodeRef.current
            .start(
                { facingMode: "environment" },
                config,
                async (decodedText) => {
                    setScanResult(decodedText);
                    // Try to parse JSON payload encoded in our asset QR codes
                    try {
                        const parsed = JSON.parse(decodedText);
                        setScanData(parsed);
                    } catch {
                        setScanData(null);
                    }

                    // Stop the scanner after a successful read to preserve the result
                    try {
                        await html5QrCodeRef.current.stop();
                        html5QrCodeRef.current.clear();
                        html5QrCodeRef.current = null;
                    } catch (stopErr) {
                        console.error("Error stopping scanner after read", stopErr);
                    }
                },
                () => {
                    // Handle scan errors silently
                }
            )
            .catch((err) => {
                console.error("Unable to start scanning", err);
            });
    };

    const restartScanner = async () => {
        setScanResult("");
        setScanData(null);
        await Promise.resolve();
        startScanner();
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
        if (showScanner) {
            startScanner();
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
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex justify-end items-center">
                <div className="flex items-center space-x-4">
                    <Button variant="secondary" icon={QrCode} onClick={onScanClick}>
                        Scan Asset
                    </Button>
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
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
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
                        {/* Display parsed QR data in a responsive layout */}
                        {scanData ? (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-3">Asset Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500">Asset ID</div>
                                        <div className="font-medium">{scanData.id}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Asset Tag</div>
                                        <div className="font-medium">{scanData.asset_tag}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Model</div>
                                        <div className="font-medium">{scanData.model}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Manufacturer</div>
                                        <div className="font-medium">{scanData.manufacturer}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Category</div>
                                        <div className="font-medium">{scanData.category}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Location</div>
                                        <div className="font-medium">{scanData.location}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">State</div>
                                        <div className="font-medium">{scanData.state}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Condition</div>
                                        <div className="font-medium">{scanData.condition}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Assigned To</div>
                                        <div className="font-medium">{scanData.assigned_to || 'Unassigned'}</div>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <div className="text-xs text-gray-500">Assigned Email</div>
                                        <div className="font-medium break-words">{scanData.assigned_email || '-'}</div>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <div className="text-xs text-gray-500">Assigned Date</div>
                                        <div className="font-medium">{scanData.assigned_date || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : scanResult ? (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800">Scanned Data (unparsed)</p>
                                <p className="text-sm text-yellow-700 mt-1 break-all">{scanResult}</p>
                            </div>
                        ) : null}
                        {/* Actions: allow rescanning without closing modal */}
                        {(scanData || scanResult) && (
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button variant="secondary" onClick={restartScanner} icon={QrCode}>
                                    Scan another
                                </Button>
                                <Button variant="ghost" onClick={closeScanner}>
                                    Close
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}