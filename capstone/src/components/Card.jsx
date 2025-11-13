export default function Card({ title, val }) {
    return (
        // fixed-size card so all cards are consistent regardless of content
        <div className="bg-white p-4 rounded-lg shadow-md w-48 h-36 flex flex-col justify-center items-start overflow-hidden">
            <p className="text-sm text-gray-600 truncate w-full">{title}</p>
            <p className="text-2xl font-semibold truncate w-full">{val}</p>
        </div>
    )
}