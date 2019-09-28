import { Token } from 'src/app/services/api/login/token';

export interface User {
    id: number;
    email: string;
    password: string;
    offline_only: boolean;
    token: Token;
}
