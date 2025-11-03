import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, ChevronDown, QrCode, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "./Button";

export default function Ribbon() {
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const onScanClick = () => {
        setShowScanner(true);
    };

    const closeScanner = () => {
        setShowScanner(false);
        setScanResult("");
    };

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

    return (
        <>
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
                    <Button variant="secondary" icon={QrCode} onClick={onScanClick}>
                        Scan Asset
                    </Button>
                    <Bell className="text-gray-500 w-6 h-6 hover:text-gray-800 cursor-pointer" />
                    <div className="flex items-center space-x-2 cursor-pointer">
                        <User className="text-gray-500 w-6 h-6 rounded-full bg-gray-200 p-1" />
                        <span className="text-sm font-medium">Admin User</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
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