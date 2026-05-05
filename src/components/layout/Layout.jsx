import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useTheme } from '../../context/ThemeContext';

export function Layout({ children }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <div
            className={
                isDark
                    ? 'min-h-screen flex flex-col bg-[#0f0f13] text-white font-sans'
                    : 'min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans'
            }
        >
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
        </div>
    );
}
