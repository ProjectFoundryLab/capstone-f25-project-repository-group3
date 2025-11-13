export default function Tag({color, children}) {
    const colors = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
        purple: 'bg-purple-100 text-purple-800',
    };

    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[color]}`}>{children}</span>
}