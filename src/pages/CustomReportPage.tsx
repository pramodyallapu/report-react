import { useNavigate } from 'react-router-dom';
import CustomReportWizard from '../components/CustomReportWizard';
import MainLayout from '../components/MainLayout';
import * as api from '../services/api';

export default function CustomReportPage() {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate('/');
    };

    const handleSave = async (config: any) => {
        try {
            console.log('Saving custom report config:', config);
            await api.advancedReportsAPI.saveReport(config);
            // Optionally show a success toast here
            navigate('/');
        } catch (err) {
            console.error('Failed to save report:', err);
            // Handle error (show message to user)
        }
    };

    const handleLogout = async () => {
        try {
            await api.authAPI.logout();
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    // We pass isPage=true to tell the component it's being rendered as a full page
    return (
        <MainLayout onLogout={handleLogout}>
            <div className="h-[calc(100vh-100px)]">
                <CustomReportWizard onClose={handleClose} onSave={handleSave} />
            </div>
        </MainLayout>
    );
}
