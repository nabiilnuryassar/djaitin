import type { ImgHTMLAttributes } from 'react';
import logo from '../../images/logo/logo-djaitin-transparan.png';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={logo}
            alt="Djaitin Logo"
        />
    );
}
