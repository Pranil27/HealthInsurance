import { LoginForm } from "./LoginForm"
import Cookies from 'js-cookie';

export const Logout =  () => {
    Cookies.set("token","");
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    return <LoginForm></LoginForm>;
}