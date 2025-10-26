export default function MenuBar() {
    return (
        <aside className="menu-bar bg-gray-800 text-white w-[20%] flex flex-col">
            <div className="heading-container border-b-1 border-gray-500">
                <h1 className="text-4xl font-bold p-4">ITAM System</h1>
            </div>
            <nav>
                <ul>
                    <li>Dashboard</li>
                </ul>
            </nav>
        </aside>
    )
}