import WindowContent from "./WindowContent";

export default function WindowSection({ title, icon: Icon, children }) {
    return (
        <div className="window-container bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="header p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="header-items flex items-center">
                    {Icon && <Icon className="w-5 h-5 mr-3 text-gray-500" />}
                    <h3>{title}</h3>
                </div>
            </div>
            <WindowContent>
                {children}
            </WindowContent>
        </div>
    )
}