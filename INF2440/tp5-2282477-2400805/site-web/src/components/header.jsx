import '../assets/css/components/header.css';
import LoginButton from '../components/loginButton';
import { Link } from 'react-router';

function Header() {

    return (
        <header>
            <Link to="/">
                <img src="logo.png" className='site-logo'></img>
            </Link>
            <h1>PolyPost</h1>
            <LoginButton />
        </header>
    );
}

export default Header;
