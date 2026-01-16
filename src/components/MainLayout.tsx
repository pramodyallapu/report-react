import type { ReactNode } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    BarChart3,
    Home,
    Share2,
    Calendar,
    FileText,
    Users,
    Heart,
    DollarSign,
    TrendingUp,
    Clock,
    Wallet,
    Target,
    Search,
    Plus,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import { reportCategories } from '../data/reports';

interface MainLayoutProps {
    children: ReactNode;
    onLogout: () => Promise<void>;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    selectedCategory?: string | null;
    onCategorySelect?: (categoryId: string | null) => void;
}

export default function MainLayout({
    children,
    onLogout,
    searchQuery = '',
    onSearchChange,
    selectedCategory = null,
    onCategorySelect
}: MainLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get icon component by name
    const getIcon = (iconName: string) => {
        const icons: Record<string, any> = {
            BarChart3,
            Users,
            Heart,
            Calendar,
            DollarSign,
            TrendingUp,
            Clock,
            FileText,
            Wallet,
            Target,
        };
        return icons[iconName] || FileText;
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo cursor-pointer" onClick={() => navigate('/')}>
                        <BarChart3 size={24} />
                        <span>Reports Center</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* Main Navigation */}
                    <div className="nav-section">
                        <div className="nav-section-title">Navigation</div>
                        <a
                            href="#"
                            className={`nav-item ${location.pathname === '/' && !selectedCategory ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/');
                                if (onCategorySelect) onCategorySelect(null);
                            }}
                        >
                            <Home size={18} />
                            <span>Home</span>
                        </a>
                        <a
                            href="#"
                            className={`nav-item ${location.pathname === '/' && searchParams.get('view') === 'shared' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/?view=shared');
                            }}
                        >
                            <Share2 size={18} />
                            <span>Shared Reports</span>
                        </a>
                        <a
                            href="/scheduled"
                            className={`nav-item ${location.pathname === '/scheduled' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/scheduled');
                            }}
                        >
                            <Calendar size={18} />
                            <span>Scheduled Reports</span>
                        </a>
                    </div>

                    {/* Report Categories */}
                    <div className="nav-section">
                        <div className="nav-section-title">Report Category</div>
                        {reportCategories.map((category) => {
                            const IconComponent = getIcon(category.icon);
                            return (
                                <div
                                    key={category.id}
                                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => {
                                        // If not on home page, navigate to home with category param
                                        if (location.pathname !== '/') {
                                            navigate(`/?category=${category.id}`);
                                        } else {
                                            // On home page, use the handler if available
                                            if (onCategorySelect) {
                                                onCategorySelect(selectedCategory === category.id ? null : category.id);
                                            }
                                        }
                                    }}
                                >
                                    <div className="category-item-left">
                                        <IconComponent size={16} />
                                        <span>{category.name}</span>
                                    </div>
                                    <ChevronRight
                                        size={14}
                                        style={{
                                            transform: selectedCategory === category.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="header-title">Reports Center</h1>
                            <div className="search-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    className="input search-input"
                                    placeholder="Search reports"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    // Disable search if no handler provided (e.g. on details page)
                                    disabled={!onSearchChange}
                                    style={{ opacity: !onSearchChange ? 0.6 : 1, cursor: !onSearchChange ? 'default' : 'text' }}
                                />
                            </div>
                        </div>
                        <div className="header-right">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/custom-report')}
                            >
                                <Plus size={18} />
                                Create Custom Report
                            </button>
                            <button className="btn btn-ghost" onClick={onLogout} title="Logout">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="content">
                    {children}
                </div>
            </main>
        </div>
    );
}
