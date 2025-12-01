
import { useState, useRef, useEffect } from "react";
import { QrCode, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Button from "./Button";

export default function QRScanner({ isMobileView = false }) {
    const [showScanner, setShowScanner] = useState(false);
    const [scanResult, setScanResult] = useState("");
    const [scanData, setScanData] = useState(null);
    const [scanError, setScanError] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const onScanClick = () => {
        setShowScanner(true);
    };

    const closeScanner = () => {
        setShowScanner(false);
        setScanResult("");
        setScanData(null);
        setScanError("");
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
                    setScanError("");
                    // Try to parse JSON payload encoded in our asset QR codes
                    try {
                        const parsed = JSON.parse(decodedText);
                        // Asset QR code must have at least id, asset_tag, model, manufacturer
                        if (
                            parsed &&
                            typeof parsed === "object" &&
                            parsed.id &&
                            parsed.asset_tag &&
                            parsed.model &&
                            parsed.manufacturer
                        ) {
                            setScanData(parsed);
                        } else {
                            setScanData(null);
                            setScanError("This QR code does not contain valid asset data.");
                        }
                    } catch {
                        setScanData(null);
                        setScanError("This QR code is not a valid asset code.");
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
        setScanError("");
        await Promise.resolve();
        startScanner();
    };

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

    return (
        <>
            {isMobileView ? (
                <button
                    onClick={onScanClick}
                    className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 px-8 rounded-lg transition-colors duration-200 text-xl w-full max-w-xs mx-auto"
                    style={{ minHeight: 64 }}
                >
                    <QrCode className="w-8 h-8" />
                    Scan Asset
                </button>
            ) : (
                <Button variant="secondary" icon={QrCode} onClick={onScanClick}>
                    Scan Asset
                </Button>
            )}

            {showScanner && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-2">
                    <div className="bg-white rounded-lg p-2 sm:p-6 w-full max-w-md mx-auto relative overflow-y-auto max-h-[95vh] shadow-lg">
                        <div className="flex justify-between items-center mb-2 sm:mb-4 px-2 sm:px-0">
                            <h2 className="text-lg sm:text-xl font-semibold">Scan QR Code</h2>
                            <button
                                onClick={closeScanner}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Close scanner"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {!scanData && (
                            <div
                                id="qr-reader"
                                ref={scannerRef}
                                className="w-full rounded-lg overflow-hidden min-h-[220px] max-h-[320px] mx-auto"
                                style={{ background: '#f3f4f6' }}
                            ></div>
                        )}
                        {/* Error message for invalid QR codes */}
                        {scanError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-medium text-red-800">{scanError}</p>
                            </div>
                        )}
                        {/* Display parsed QR data in a responsive layout */}
                        {scanData ? (
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <h3 className="text-base sm:text-lg font-semibold mb-3">Asset Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-500">Asset ID</div>
                                        <div className="font-medium break-words">{scanData.id}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Asset Tag</div>
                                        <div className="font-medium break-words">{scanData.asset_tag}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Model</div>
                                        <div className="font-medium break-words">{scanData.model}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Manufacturer</div>
                                        <div className="font-medium break-words">{scanData.manufacturer}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Category</div>
                                        <div className="font-medium break-words">{scanData.category}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Location</div>
                                        <div className="font-medium break-words">{scanData.location}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">State</div>
                                        <div className="font-medium break-words">{scanData.state}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Condition</div>
                                        <div className="font-medium break-words">{scanData.condition}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Assigned To</div>
                                        <div className="font-medium break-words">{scanData.assigned_to || 'Unassigned'}</div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="text-xs text-gray-500">Assigned Email</div>
                                        <div className="font-medium break-words">{scanData.assigned_email || '-'}</div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="text-xs text-gray-500">Assigned Date</div>
                                        <div className="font-medium break-words">{scanData.assigned_date || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        ) : scanResult && !scanError ? (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800">Scanned Data (unparsed)</p>
                                <p className="text-sm text-yellow-700 mt-1 break-all">{scanResult}</p>
                            </div>
                        ) : null}
                        {/* Actions: allow rescanning without closing modal */}
                        {(scanData || scanResult || scanError) && (
                            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
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
