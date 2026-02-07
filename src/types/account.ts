export type AccountType = 'LDAP' | 'LOCAL';

export type Label = {
    text: string;
};

export interface Account {
    id: string;
    type: AccountType;
    login: string;
    password: string | null;
    labels: Label[];
}