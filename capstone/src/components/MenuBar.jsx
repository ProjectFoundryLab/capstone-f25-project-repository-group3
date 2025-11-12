import { 
    BarChart2, HardDrive, Users, LifeBuoy, Settings, Package, Bookmark, Wrench, Shield, Building, ShoppingCart
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function MenuBar(props) {
    const navigate = useNavigate()

    const navItems = [
        { name: 'Dashboard', icon: BarChart2, page: 'Dashboard' },
        { name: 'Assets', icon: HardDrive, page: 'Assets' },
        { name: 'Software', icon: Package, page: 'Software' },
        { name: 'Procurement', icon: ShoppingCart, page: 'Procurement' },
        { name: 'Users', icon: Users, page: 'Users' },
        { name: 'Departments', icon: Building, page: 'Departments' },
        { name: 'Warranties', icon: Bookmark, page: 'Warranties' },
        { name: 'Maintenance', icon: Wrench, page: 'Maintenance' },
        { name: 'Security', icon: Shield, page: 'Security' },
    ];

    const helpItems = [
        { name: 'Support', icon: LifeBuoy, page: 'Support' },
        { name: 'Settings', icon: Settings, page: 'Settings' },
    ];

    const NavLink = ({ item, onClick }) => (
         <a 
            href="#" 
            key={item.name} 
            onClick={onClick}
            className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                props.currentPage === item.page 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
        </a>
    );

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            navigate('/auth')
        } catch (error) {
            console.error('Error signing out:', error.message)
            // Even if there's an error, redirect to auth
            navigate('/auth')
        }
    }

    return (
        <aside className="w-65 h-screen bg-gray-800 text-white flex flex-col flex-shrink-0">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-white">ITAM System</h1>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map(item => <NavLink key={item.name} item={item} onClick={() => props.setCurrentPage(item.name)} />)}
            </nav>
            <div className="p-2 border-t border-gray-700">
                 {helpItems.map(item => <NavLink key={item.name} item={item} onClick={() => props.setCurrentPage(item.name)} />)}
            </div>
            <button onClick={handleSignOut}>Sign out</button>
        </aside>
    );
}