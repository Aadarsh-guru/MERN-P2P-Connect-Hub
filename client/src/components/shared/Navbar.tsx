import { Link } from 'react-router-dom';
import ModeToggle from './ModeToggle';

const Navbar: React.FC = () => {

    return (
        <nav className={`h-20 flex items-center justify-between border-b px-4 md:px-0`} >
            <Link className={`md:ml-0 flex items-center gap-2`} to={'/'} >
                <img
                    className='h-10 object-cover rounded-full'
                    src={'/logo.png'}
                    alt="logo"
                    height={40}
                    width={40}
                />
                <span className='text-lg font-semibold text-blue-500 transition-color  dark:text-white dark:hover:text-gray-200 hover:text-blue-600' >
                    Connect Hub
                </span>
            </Link>
            <div className="flex gap-5 items-center transition-colors">
                <ModeToggle />
            </div>
        </nav>
    );
};

export default Navbar;