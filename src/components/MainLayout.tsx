import { useState, useEffect, useRef } from 'react';
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
    ChevronLeft,
    Sun,
    Moon,
    Bell,
    CheckCircle,
    AlertCircle,
    Info,
    Settings,
    X,
    MessageCircle,
    Send,
    Minus,
} from 'lucide-react';
import { reportCategories } from '../data/reports';
import logo from '../assets/image copy.png';
import { notificationsAPI, chatbotAPI } from '../services/api';

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

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([
        {
            id: 1,
            text: "Hi! I'm your Reports AI. I can help explore your project! \nTry asking about: \n- *'Sidebar Hover vs Default'*\n- *'How to export as PDF'*\n- *'Custom Report Builder'*\n- *'The Dashboard Tech Stack'*",
            sender: 'bot',
            time: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatTyping, setIsChatTyping] = useState(false);

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        const userMsg = { id: Date.now(), text: chatInput, sender: 'user', time: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatTyping(true);

        try {
            const data = await chatbotAPI.ask(chatInput);
            setTimeout(() => {
                setChatMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: data.response,
                    sender: 'bot',
                    time: new Date()
                }]);
                setIsChatTyping(false);
            }, 1000);
        } catch (error) {
            console.error("Chat error:", error);
            setIsChatTyping(false);
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting. Please try again later.",
                sender: 'bot',
                time: new Date()
            }]);
        }
    };
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState<'style' | 'colors'>('style');
    const [layoutStyle, setLayoutStyle] = useState(() => localStorage.getItem('layoutStyle') || 'full');
    const [menuStyle, setMenuStyle] = useState(() => localStorage.getItem('menuStyle') || 'click');
    const [menuPosition, setMenuPosition] = useState(() => localStorage.getItem('menuPosition') || 'fixed');
    const [headerPosition, setHeaderPosition] = useState(() => localStorage.getItem('headerPosition') || 'fixed');
    const [loaderEnabled, setLoaderEnabled] = useState(() => localStorage.getItem('loaderEnabled') !== 'false');
    const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('primaryColor') || '#4f46e5');
    const bgGalleryRef = useRef<HTMLDivElement>(null);

    const scrollGallery = (direction: 'left' | 'right') => {
        if (bgGalleryRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            bgGalleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    const [menuBgColor, setMenuBgColor] = useState(() => localStorage.getItem('menuBgColor') || 'default');
    const [headerBgColor, setHeaderBgColor] = useState(() => localStorage.getItem('headerBgColor') || 'default');
    const [sidebarImage, setSidebarImage] = useState(() => localStorage.getItem('sidebarImage') || null);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Apply Global Styles based on settings
        const root = document.documentElement;

        // Primary Color and variants
        root.style.setProperty('--color-primary', primaryColor);
        // Calculate a hover color (simulated with opacity or fixed transform)
        root.style.setProperty('--color-primary-hover', primaryColor + 'cc');
        root.style.setProperty('--color-primary-light', primaryColor + '1a'); // 10% opacity

        // Sidebar Width variable
        let baseWidth = '260px';
        if (menuStyle === 'hover' || menuStyle === 'default') {
            baseWidth = '80px';
        } else if (menuStyle === 'horizontal') {
            baseWidth = '0px';
        }
        root.style.setProperty('--sidebar-width', baseWidth);

        // Persist settings
        localStorage.setItem('layoutStyle', layoutStyle);
        localStorage.setItem('menuStyle', menuStyle);
        localStorage.setItem('menuPosition', menuPosition);
        localStorage.setItem('headerPosition', headerPosition);
        localStorage.setItem('loaderEnabled', loaderEnabled.toString());
        localStorage.setItem('primaryColor', primaryColor);
        localStorage.setItem('menuBgColor', menuBgColor);
        localStorage.setItem('headerBgColor', headerBgColor);
        if (sidebarImage) localStorage.setItem('sidebarImage', sidebarImage);
        else localStorage.removeItem('sidebarImage');

    }, [primaryColor, layoutStyle, menuStyle, menuPosition, headerPosition, loaderEnabled, menuBgColor, headerBgColor, sidebarImage]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    const fetchNotifications = async () => {
        try {
            const data = await notificationsAPI.fetch(10);
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const markAllRead = async () => {
        try {
            await notificationsAPI.markRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const handleNotificationClick = async (n: any) => {
        if (!n.is_read) {
            try {
                await notificationsAPI.markRead(n.id);
                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: 1 } : item));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Failed to mark single read:', err);
            }
        }
        if (n.link) {
            setShowNotifications(false);
            navigate(n.link);
        }
    };

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
        <div className={`flex min-h-screen ${layoutStyle === 'boxed' ? 'boxed-layout' : ''} ${menuStyle === 'hover' ? 'sidebar-hover-enabled' : ''} ${menuStyle === 'default' ? 'sidebar-default-collapsed' : ''}`}
            style={{
                background: 'var(--color-bg-secondary)',
                maxWidth: layoutStyle === 'boxed' ? '1440px' : 'none',
                margin: layoutStyle === 'boxed' ? '0 auto' : '0',
                boxShadow: layoutStyle === 'boxed' ? '0 0 50px rgba(0,0,0,0.1)' : 'none',
                position: 'relative',
                overflow: menuPosition === 'scrollable' ? 'auto' : 'hidden'
            }}
        >
            {/* Sidebar */}
            {menuStyle !== 'horizontal' && (
                <aside
                    className={`sidebar ${menuStyle === 'hover' ? 'sidebar-hover-enabled' : ''} ${menuStyle === 'default' ? 'sidebar-default-collapsed' : ''}`}
                    data-menu-style={menuStyle}
                    style={{
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        backgroundImage: sidebarImage ? `linear-gradient(rgba(13, 11, 46, 0.8), rgba(13, 11, 46, 0.8)), url(${sidebarImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: menuBgColor !== 'default' ? menuBgColor : 'var(--color-sidebar-bg)',
                        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                        width: 'var(--sidebar-width)',
                        zIndex: 100,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: '1px solid var(--color-border-light)'
                    }}
                >
                    <div className="sidebar-header">
                        <div className="sidebar-logo" style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0'
                        }} onClick={() => navigate('/')}>
                            <img
                                src={logo}
                                alt="TherapyPM Logo"
                                style={{
                                    height: '35px',
                                    maxWidth: '180px',
                                    objectFit: 'contain',
                                    filter: (isDarkMode || menuBgColor !== 'default') ? 'brightness(1.5)' : 'none',
                                    transition: 'all 0.3s ease',
                                    margin: menuStyle === 'default' ? '0 auto' : '0'
                                }}
                                className="sidebar-main-logo"
                            />
                        </div>
                    </div>

                    <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                        {/* Main Navigation */}
                        <div className="nav-section">
                            <div className="nav-section-title">Navigation</div>
                            <a
                                href="#"
                                className={`nav-item ${location.pathname === '/' && !selectedCategory && searchParams.get('view') !== 'shared' ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/');
                                    if (onCategorySelect) onCategorySelect(null);
                                }}
                            >
                                <Home size={18} />
                                <span className="nav-text">Home</span>
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
                                <span className="nav-text">Shared Reports</span>
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
                                <span className="nav-text">Scheduled Reports</span>
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
                                        className={`category-item-container`}
                                        style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 0' }}
                                    >
                                        <div
                                            className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                            onClick={() => {
                                                if (location.pathname !== '/') {
                                                    navigate(`/?category=${category.id}`);
                                                } else {
                                                    if (onCategorySelect) {
                                                        onCategorySelect(selectedCategory === category.id ? null : category.id);
                                                    }
                                                }
                                            }}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                        >
                                            <div className="category-item-left" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-sm)'
                                            }}>
                                                <IconComponent size={16} />
                                                <span className="nav-text">{category.name}</span>
                                            </div>
                                            <div className="category-item-right" style={{ display: 'flex' }}>
                                                <ChevronRight
                                                    size={14}
                                                    style={{
                                                        opacity: selectedCategory === category.id ? 1 : 0.5,
                                                        transform: selectedCategory === category.id ? 'rotate(90deg)' : 'none',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Sidebar Footer - Logout */}
                    <div className="sidebar-footer" style={{
                        padding: '1rem',
                        borderTop: '1px solid var(--color-border-light)',
                        marginTop: 'auto'
                    }}>
                        <div className="nav-section" style={{ margin: 0 }}>
                            <a
                                href="#"
                                className="nav-item"
                                style={{
                                    color: 'var(--color-danger)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    textDecoration: 'none',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onLogout();
                                }}
                            >
                                <LogOut size={18} />
                                <span className="nav-text">Logout</span>
                            </a>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="main-content" style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: (menuPosition === 'fixed' || layoutStyle === 'boxed') ? 'auto' : 'visible',
                height: (menuPosition === 'fixed' || layoutStyle === 'boxed') ? '100vh' : 'auto',
                marginLeft: 0, // Flexbox handles it with sticky sidebar
                width: '100%',
                maxWidth: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header */}
                <header className="header glass" style={{
                    position: headerPosition === 'fixed' ? 'sticky' : 'relative',
                    top: 0,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: menuStyle === 'horizontal' ? '0' : '1.25rem 2.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    background: headerBgColor !== 'default' ? headerBgColor : 'var(--color-bg-primary)',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease'
                }}>
                    <div className="header-top" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: menuStyle === 'horizontal' ? '1rem 2.5rem' : '0'
                    }}>
                        <div className="header-left" style={{ flex: 1, display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            {menuStyle === 'horizontal' && (
                                <div className="sidebar-logo" style={{ cursor: 'pointer', marginRight: '1rem', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
                                    <img
                                        src={logo}
                                        alt="TherapyPM Logo"
                                        style={{
                                            height: '32px',
                                            maxWidth: '150px',
                                            objectFit: 'contain',
                                            filter: (isDarkMode || headerBgColor !== 'default') ? 'brightness(1.5)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                </div>
                            )}
                            <h1 className="header-title" style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: 'var(--color-text-primary)',
                                margin: 0,
                                letterSpacing: '-0.025em'
                            }}>Dashboard</h1>
                            <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                                <Search size={20} className="search-icon" style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-tertiary)'
                                }} />
                                <input
                                    type="text"
                                    className="input search-input"
                                    placeholder="Search reports"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                                    disabled={!onSearchChange}
                                    style={{
                                        opacity: !onSearchChange ? 0.6 : 1,
                                        cursor: !onSearchChange ? 'default' : 'text',
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '2rem',
                                        border: '2px solid transparent',
                                        background: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle Theme" style={{
                                width: '2.5rem', height: '2.5rem', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            <button className="btn btn-ghost" onClick={() => setShowSettings(true)} title="Settings" style={{
                                width: '2.5rem', height: '2.5rem', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Settings size={20} className="settings-icon-spin" />
                            </button>


                            {/* Notifications */}
                            <div className="relative" style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNotifications(!showNotifications);
                                    }}
                                    style={{
                                        width: '2.5rem', height: '2.5rem', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            background: 'var(--color-danger)',
                                            color: 'white',
                                            fontSize: '10px',
                                            padding: '2px 5px',
                                            borderRadius: '10px',
                                            border: '2px solid var(--color-bg-primary)',
                                            fontWeight: 'bold'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="notification-dropdown glass" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '1rem',
                                        width: '350px',
                                        maxHeight: '480px',
                                        background: 'var(--color-bg-primary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '1rem',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }} onClick={(e) => e.stopPropagation()}>
                                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                                    <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                                    <p style={{ margin: 0 }}>No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className="notification-item"
                                                        style={{
                                                            padding: '1rem',
                                                            borderBottom: '1px solid var(--color-border-light)',
                                                            cursor: 'pointer',
                                                            background: n.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                                                            transition: 'background 0.2s',
                                                            display: 'flex',
                                                            gap: '0.75rem'
                                                        }}
                                                    >
                                                        <div style={{ marginTop: '0.25rem' }}>
                                                            {n.type === 'success' ? <CheckCircle size={18} color="var(--color-success)" /> :
                                                                n.type === 'warning' ? <AlertCircle size={18} color="var(--color-warning)" /> :
                                                                    <Info size={18} color="var(--color-primary)" />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <span style={{ fontWeight: n.is_read ? '600' : '700', fontSize: '14px', color: 'var(--color-text-primary)' }}>{n.title}</span>
                                                                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: '0.25rem 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{n.message}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-tertiary)' }}>Activity Hub</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/custom-report')}
                                style={{
                                    borderRadius: '2rem',
                                    padding: '0.75rem 1.5rem',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Plus size={20} />
                                Create Pipeline
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Menu Nav Bar */}
                    {menuStyle === 'horizontal' && (
                        <div className="horizontal-nav" style={{
                            padding: '0 2.5rem',
                            borderTop: '1px solid var(--color-border-light)',
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto'
                        }}>
                            <a
                                href="#"
                                className={`h-nav-item ${location.pathname === '/' && !selectedCategory && searchParams.get('view') !== 'shared' ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/');
                                    if (onCategorySelect) onCategorySelect(null);
                                }}
                            >
                                <Home size={16} />
                                <span>Home</span>
                            </a>
                            <a
                                href="#"
                                className={`h-nav-item ${location.pathname === '/' && searchParams.get('view') === 'shared' ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/?view=shared');
                                }}
                            >
                                <Share2 size={16} />
                                <span>Shared</span>
                            </a>
                            <a
                                href="/scheduled"
                                className={`h-nav-item ${location.pathname === '/scheduled' ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/scheduled');
                                }}
                            >
                                <Calendar size={16} />
                                <span>Scheduled</span>
                            </a>
                            <div style={{ height: '24px', width: '1px', background: 'var(--color-border)', margin: 'auto 0.5rem' }} />
                            {reportCategories.map((category) => {
                                const IconComponent = getIcon(category.icon);
                                return (
                                    <a
                                        key={category.id}
                                        href="#"
                                        className={`h-nav-item ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (location.pathname !== '/') {
                                                navigate(`/?category=${category.id}`);
                                            } else {
                                                if (onCategorySelect) {
                                                    onCategorySelect(selectedCategory === category.id ? null : category.id);
                                                }
                                            }
                                        }}
                                    >
                                        <IconComponent size={16} />
                                        <span>{category.name}</span>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </header>

                {/* Content */}
                <div className="content">
                    {children}
                </div>

                {/* Settings Modal Overhead Overlay */}
                {showSettings && (
                    <div className="settings-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            zIndex: 1000,
                            backdropFilter: 'blur(4px)',
                            animation: 'fadeIn 0.3s ease'
                        }}
                        onClick={() => setShowSettings(false)}
                    >
                        <div className="settings-modal"
                            style={{
                                width: '400px',
                                background: 'var(--color-bg-primary)',
                                height: '100vh',
                                boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                animation: 'slideInRight 0.3s ease',
                                overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>Setting</h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: '1rem',
                                    padding: '0.5rem',
                                    gap: '0.5rem'
                                }}>
                                    <button
                                        onClick={() => setActiveTab('style')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            background: activeTab === 'style' ? 'var(--color-bg-primary)' : 'transparent',
                                            color: activeTab === 'style' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                            boxShadow: activeTab === 'style' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Theme Style
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('colors')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            background: activeTab === 'colors' ? 'var(--color-bg-primary)' : 'transparent',
                                            color: activeTab === 'colors' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                            boxShadow: activeTab === 'colors' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Theme Colors
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 2rem' }}>
                                {activeTab === 'style' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Theme color mode */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Theme color mode:</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setIsDarkMode(false)} className={`setting-toggle ${!isDarkMode ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {!isDarkMode && <div className="toggle-check" />}
                                                    </div>
                                                    Light
                                                </button>
                                                <button onClick={() => setIsDarkMode(true)} className={`setting-toggle ${isDarkMode ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {isDarkMode && <div className="toggle-check" />}
                                                    </div>
                                                    Dark
                                                </button>
                                            </div>
                                        </div>

                                        {/* Layout width style */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Layout width style</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setLayoutStyle('full')} className={`setting-toggle ${layoutStyle === 'full' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {layoutStyle === 'full' && <div className="toggle-check" />}
                                                    </div>
                                                    Full width
                                                </button>
                                                <button onClick={() => setLayoutStyle('boxed')} className={`setting-toggle ${layoutStyle === 'boxed' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {layoutStyle === 'boxed' && <div className="toggle-check" />}
                                                    </div>
                                                    Boxed
                                                </button>
                                            </div>
                                        </div>

                                        {/* Menu style */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Vertical & Horizontal menu style</h3>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                <button onClick={() => setMenuStyle('click')} className={`setting-toggle ${menuStyle === 'click' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuStyle === 'click' && <div className="toggle-check" />}
                                                    </div>
                                                    Menu click
                                                </button>
                                                <button onClick={() => setMenuStyle('hover')} className={`setting-toggle ${menuStyle === 'hover' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuStyle === 'hover' && <div className="toggle-check" />}
                                                    </div>
                                                    Icon hover
                                                </button>
                                                <button onClick={() => setMenuStyle('default')} className={`setting-toggle ${menuStyle === 'default' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuStyle === 'default' && <div className="toggle-check" />}
                                                    </div>
                                                    Icon default
                                                </button>
                                                <button onClick={() => setMenuStyle('horizontal')} className={`setting-toggle ${menuStyle === 'horizontal' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuStyle === 'horizontal' && <div className="toggle-check" />}
                                                    </div>
                                                    Horizontal
                                                </button>
                                            </div>
                                        </div>

                                        {/* Menu position */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Menu position</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setMenuPosition('fixed')} className={`setting-toggle ${menuPosition === 'fixed' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuPosition === 'fixed' && <div className="toggle-check" />}
                                                    </div>
                                                    Fixed
                                                </button>
                                                <button onClick={() => setMenuPosition('scrollable')} className={`setting-toggle ${menuPosition === 'scrollable' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {menuPosition === 'scrollable' && <div className="toggle-check" />}
                                                    </div>
                                                    Scrollable
                                                </button>
                                            </div>
                                        </div>

                                        {/* Header position */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Header positions</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setHeaderPosition('fixed')} className={`setting-toggle ${headerPosition === 'fixed' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {headerPosition === 'fixed' && <div className="toggle-check" />}
                                                    </div>
                                                    Fixed
                                                </button>
                                                <button onClick={() => setHeaderPosition('scrollable')} className={`setting-toggle ${headerPosition === 'scrollable' ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {headerPosition === 'scrollable' && <div className="toggle-check" />}
                                                    </div>
                                                    Scrollable
                                                </button>
                                            </div>
                                        </div>

                                        {/* Loader */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Loader</h3>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setLoaderEnabled(true)} className={`setting-toggle ${loaderEnabled ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {loaderEnabled && <div className="toggle-check" />}
                                                    </div>
                                                    Enable
                                                </button>
                                                <button onClick={() => setLoaderEnabled(false)} className={`setting-toggle ${!loaderEnabled ? 'active' : ''}`}>
                                                    <div className="toggle-circle">
                                                        {!loaderEnabled && <div className="toggle-check" />}
                                                    </div>
                                                    Disable
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '0.875rem',
                                                border: 'none',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                fontWeight: '800',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                marginTop: '1rem',
                                                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)'
                                            }}
                                            onClick={() => {
                                                setLayoutStyle('full');
                                                setMenuStyle('click');
                                                setMenuPosition('fixed');
                                                setHeaderPosition('fixed');
                                                setLoaderEnabled(true);
                                                setIsDarkMode(false);
                                                setPrimaryColor('#4f46e5');
                                                setMenuBgColor('default');
                                                setHeaderBgColor('default');
                                                setSidebarImage(null);
                                            }}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {/* Menu Background color */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>Menu Background color</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>Note:If you want to change color Menu dynamically change from below Theme Primary color picker</p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {[
                                                    { name: 'default', color: '#1e1b4b' },
                                                    { name: 'navy', color: '#1e293b' },
                                                    { name: 'black', color: '#0f172a' },
                                                    { name: 'purple', color: '#2d2b42' }
                                                ].map(c => (
                                                    <div
                                                        key={c.name}
                                                        onClick={() => setMenuBgColor(c.color)}
                                                        style={{
                                                            width: '40px', height: '40px', background: c.color, borderRadius: '8px',
                                                            border: '2px solid var(--color-border)', cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: menuBgColor === c.color ? '0 0 0 2px var(--color-primary)' : 'none'
                                                        }}
                                                    >
                                                        {menuBgColor === c.color && <CheckCircle size={16} color="var(--color-success)" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Header Background color */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>Header Background color</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>Note:If you want to change color Header dynamically change from below Theme Primary color picker</p>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                {[
                                                    { name: 'default', color: '#ffffff' },
                                                    { name: 'navy', color: '#1e293b' },
                                                    { name: 'black', color: '#0f172a' },
                                                    { name: 'purple', color: '#2d2b42' }
                                                ].map(c => (
                                                    <div
                                                        key={c.name}
                                                        onClick={() => setHeaderBgColor(c.color)}
                                                        style={{
                                                            width: '40px', height: '40px', background: c.color, borderRadius: '8px',
                                                            border: '2px solid var(--color-border)', cursor: 'pointer', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: headerBgColor === c.color ? '0 0 0 2px var(--color-primary)' : 'none'
                                                        }}
                                                    >
                                                        {headerBgColor === c.color && <CheckCircle size={16} color="var(--color-success)" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Theme Primary color */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Theme Primary color</h3>
                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                {['#4f46e5', '#f97316', '#14b8a6', '#8b5cf6', '#10b981'].map(c => (
                                                    <div key={c} onClick={() => setPrimaryColor(c)} style={{
                                                        width: '40px', height: '40px', background: c, borderRadius: '8px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: primaryColor === c ? '0 0 0 2px white, 0 0 0 4px ' + c : 'none'
                                                    }}>
                                                        {primaryColor === c && <CheckCircle size={20} color="white" />}
                                                    </div>
                                                ))}
                                                <div style={{ position: 'relative', width: '40px', height: '40px', background: 'var(--color-bg-tertiary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                                                    <div style={{ fontSize: '20px' }}>🎨</div>
                                                    <input
                                                        type="color"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Theme Background color */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Theme Background color</h3>
                                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                {['#f8fafc', '#1e293b', '#0f172a', '#111827', '#171717'].map(c => (
                                                    <div key={c} style={{ width: '40px', height: '40px', background: c, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-border)' }}>
                                                        {c === '#f8fafc' && <CheckCircle size={16} color="var(--color-success)" />}
                                                    </div>
                                                ))}
                                                <div style={{ width: '40px', height: '40px', background: 'var(--color-bg-tertiary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)' }}>
                                                    <div style={{ fontSize: '20px' }}>🎨</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Background Images - Slider Version */}
                                        <div className="setting-section">
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Menu with background image</h3>
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                {/* Left Arrow */}
                                                <button
                                                    onClick={() => scrollGallery('left')}
                                                    style={{
                                                        position: 'absolute', left: '-10px', zIndex: 10,
                                                        width: '30px', height: '30px', borderRadius: '50%',
                                                        background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                                        color: 'var(--color-text-primary)'
                                                    }}
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                {/* Scrollable Container */}
                                                <div
                                                    ref={bgGalleryRef}
                                                    className="bg-gallery-scroll"
                                                    style={{
                                                        display: 'flex', gap: '0.75rem', overflowX: 'auto',
                                                        padding: '0.25rem 0.5rem', scrollbarWidth: 'none',
                                                        scrollSnapType: 'x mandatory',
                                                        msOverflowStyle: 'none',
                                                        WebkitOverflowScrolling: 'touch'
                                                    }}
                                                >
                                                    {[
                                                        { id: 100, url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200' },
                                                        { id: 101, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=200' },
                                                        { id: 102, url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200' },
                                                        { id: 103, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200' },
                                                        { id: 104, url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=200' },
                                                        { id: 105, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200' },
                                                        { id: 106, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200' },
                                                        { id: 107, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=200' },
                                                        { id: 108, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=200' },
                                                        { id: 109, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=200' }
                                                    ].map(img => (
                                                        <div
                                                            key={img.id}
                                                            onClick={() => setSidebarImage(img.url === sidebarImage ? null : img.url)}
                                                            style={{
                                                                height: '80px',
                                                                minWidth: '80px',
                                                                borderRadius: '8px',
                                                                backgroundImage: `url(${img.url})`,
                                                                backgroundSize: 'cover',
                                                                cursor: 'pointer',
                                                                position: 'relative',
                                                                border: sidebarImage === img.url ? '2px solid var(--color-primary)' : '2px solid transparent',
                                                                transition: 'all 0.2s',
                                                                scrollSnapAlign: 'start'
                                                            }}
                                                        >
                                                            {sidebarImage === img.url && (
                                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(79, 70, 229, 0.4)', borderRadius: '6px' }}>
                                                                    <CheckCircle size={20} color="white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Right Arrow */}
                                                <button
                                                    onClick={() => scrollGallery('right')}
                                                    style={{
                                                        position: 'absolute', right: '-10px', zIndex: 10,
                                                        width: '30px', height: '30px', borderRadius: '50%',
                                                        background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                                        color: 'var(--color-text-primary)'
                                                    }}
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Always active layout styles */}
            <style>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                    .settings-icon-spin {
                        animation: spin 3s linear infinite;
                    }

                    .setting-toggle {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.875rem 1rem;
                        border-radius: 1rem;
                        border: none;
                        background: var(--color-bg-tertiary);
                        color: var(--color-text-secondary);
                        font-weight: 700;
                        font-size: 0.85rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .setting-toggle.active {
                        background: var(--color-primary-light);
                        color: var(--color-primary);
                    }

                    .toggle-circle {
                        width: 22px;
                        height: 22px;
                        border-radius: 50%;
                        border: 2px solid var(--color-border);
                        background: var(--color-bg-primary);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }

                    .setting-toggle.active .toggle-circle {
                        border-color: var(--color-primary);
                        background: var(--color-primary);
                    }

                    /* Icon Hover Mode - Expansion */
                    .sidebar[data-menu-style="hover"]:hover {
                        width: 280px !important;
                        --sidebar-width: 280px;
                        z-index: 1001;
                        background-color: var(--color-sidebar-bg) !important;
                        box-shadow: 12px 0 40px rgba(0,0,0,0.3);
                    }
                    
                    /* Strictly Hide text in Collapsed states */
                    .sidebar[data-menu-style="hover"]:not(:hover) .nav-text,
                    .sidebar[data-menu-style="hover"]:not(:hover) .nav-section-title,
                    .sidebar[data-menu-style="hover"]:not(:hover) .category-item-right,
                    .sidebar[data-menu-style="hover"]:not(:hover) .sidebar-logo-text,
                    .sidebar[data-menu-style="default"] .nav-text,
                    .sidebar[data-menu-style="default"] .nav-section-title,
                    .sidebar[data-menu-style="default"] .category-item-right,
                    .sidebar[data-menu-style="default"] .sidebar-logo-text {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                    }

                    /* Show text ONLY in Hover Expansion */
                    .sidebar[data-menu-style="hover"]:hover .nav-text,
                    .sidebar[data-menu-style="hover"]:hover .nav-section-title,
                    .sidebar[data-menu-style="hover"]:hover .category-item-right,
                    .sidebar[data-menu-style="hover"]:hover .sidebar-logo-text {
                        display: inline-block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        position: static !important;
                        transition: opacity 0.3s ease;
                    }

                    /* Prevent Expansion for Icon Default */
                    .sidebar[data-menu-style="default"]:hover {
                        width: 80px !important;
                        --sidebar-width: 80px;
                    }
                    
                     /* Center Items Logic for Collapsed states */
                     .sidebar[data-menu-style="hover"]:not(:hover) .sidebar-logo,
                    .sidebar[data-menu-style="default"] .sidebar-logo {
                        justify-content: center !important;
                        gap: 0 !important;
                        padding: 0 !important;
                    }

                    .sidebar[data-menu-style="hover"]:not(:hover) .sidebar-main-logo,
                    .sidebar[data-menu-style="default"] .sidebar-main-logo {
                        max-width: 45px !important;
                        height: auto !important;
                        margin: 0 auto !important;
                    }

                    .sidebar[data-menu-style="hover"]:not(:hover) .nav-item,
                    .sidebar[data-menu-style="default"] .nav-item {
                        min-width: 0 !important;
                        justify-content: center !important;
                        padding: 0.75rem 0 !important;
                        margin: 0 0.5rem 4px 0.5rem !important;
                        gap: 0 !important;
                    }

                    .sidebar[data-menu-style="hover"]:not(:hover) .category-item,
                    .sidebar[data-menu-style="default"] .category-item {
                        justify-content: center !important;
                        padding: 0.75rem 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        gap: 0 !important;
                    }

                    .sidebar[data-menu-style="hover"]:not(:hover) .category-item-left,
                    .sidebar[data-menu-style="default"] .category-item-left {
                        justify-content: center !important;
                        width: 100% !important;
                        gap: 0 !important;
                    }
                    
                    .sidebar[data-menu-style="hover"]:not(:hover) svg,
                    .sidebar[data-menu-style="default"] svg {
                        margin: 0 !important;
                    }

                    .sidebar-header {
                        padding: 1.5rem 1rem;
                        transition: all 0.3s ease;
                        overflow: hidden;
                    }

                    .sidebar[data-menu-style="hover"]:not(:hover) .sidebar-header,
                    .sidebar[data-menu-style="default"] .sidebar-header {
                        padding: 1.5rem 0.5rem;
                    }

                    .sidebar[data-menu-style="hover"]:hover .sidebar-header {
                        padding: 1.5rem 1rem;
                    }

                    .h-nav-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 1rem 0;
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: var(--color-text-secondary);
                        border-bottom: 2px solid transparent;
                        transition: all 0.2s;
                        white-space: nowrap;
                    }

                    .h-nav-item:hover, .h-nav-item.active {
                        color: var(--color-primary);
                        border-bottom-color: var(--color-primary);
                    }

                    .h-nav-item svg {
                        opacity: 0.8;
                    }

                    .toggle-check {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: white;
                        animation: scaleIn 0.2s ease;
                    }

                    .chat-bubble-btn {
                        position: fixed;
                        bottom: 2rem;
                        right: 2rem;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: var(--color-primary);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
                        z-index: 2000;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }

                    .chat-bubble-btn:hover {
                        transform: scale(1.1) rotate(5deg);
                        box-shadow: 0 15px 30px rgba(37, 99, 235, 0.5);
                    }

                    .chat-window {
                        position: fixed;
                        bottom: 6rem;
                        right: 2rem;
                        width: 380px;
                        height: 550px;
                        background: var(--color-bg-primary);
                        border-radius: 1.5rem;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                        z-index: 2001;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        border: 1px solid var(--color-border);
                        animation: chatSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    @keyframes chatSlideUp {
                        from { transform: translateY(20px) scale(0.95); opacity: 0; }
                        to { transform: translateY(0) scale(1); opacity: 1; }
                    }

                    .chat-header {
                        padding: 1.25rem;
                        background: var(--color-primary);
                        color: white;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .chat-messages {
                        flex: 1;
                        padding: 1.25rem;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        background: var(--color-bg-tertiary);
                    }

                    .msg-bubble {
                        max-width: 80%;
                        padding: 0.75rem 1rem;
                        border-radius: 1rem;
                        font-size: 0.9rem;
                        line-height: 1.4;
                        position: relative;
                        animation: fadeIn 0.2s ease;
                    }

                    .msg-bot {
                        align-self: flex-start;
                        background: var(--color-bg-primary);
                        color: var(--color-text-primary);
                        border-bottom-left-radius: 0.25rem;
                        border: 1px solid var(--color-border);
                    }

                    .msg-user {
                        align-self: flex-end;
                        background: var(--color-primary);
                        color: white;
                        border-bottom-right-radius: 0.25rem;
                    }

                    .chat-input-area {
                        padding: 1rem;
                        background: var(--color-bg-primary);
                        display: flex;
                        gap: 0.5rem;
                        border-top: 1px solid var(--color-border);
                    }

                    .chat-input {
                        flex: 1;
                        background: var(--color-bg-secondary);
                        border: 1px solid var(--color-border);
                        border-radius: 1.5rem;
                        padding: 0.6rem 1rem;
                        color: var(--color-text-primary);
                        outline: none;
                        transition: all 0.2s;
                    }

                    .chat-input:focus {
                        border-color: var(--color-primary);
                        background: var(--color-bg-primary);
                    }

                    .typing-indicator {
                        align-self: flex-start;
                        padding: 0.5rem 1rem;
                        background: rgba(0,0,0,0.05);
                        border-radius: 1rem;
                        font-style: italic;
                        font-size: 0.8rem;
                        color: var(--color-text-tertiary);
                    }

                    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                `}</style>

            {/* AI Assistant Chat Widget */}
            <button
                className="chat-bubble-btn"
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="AI Assistant"
            >
                {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {isChatOpen && (
                <div className="chat-window shadow-xl">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Project AI Hub</h3>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <Minus size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`msg-bubble ${msg.sender === 'bot' ? 'msg-bot' : 'msg-user'}`}>
                                {msg.text}
                                <div style={{ fontSize: '10px', marginTop: '0.25rem', opacity: 0.6, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {isChatTyping && (
                            <div className="typing-indicator">
                                <span className="animate-pulse">AI is thinking...</span>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask about project features..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                        />
                        <button
                            onClick={handleChatSend}
                            style={{
                                background: 'var(--color-primary)',
                                border: 'none',
                                color: 'white',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
