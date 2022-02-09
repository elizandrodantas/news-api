export function hideMaskMail(mail: string): string{
    let [user, domain] = mail.split('@'), r = user.substring(0, user.length / 2), n = "";

    for(let i = 0; i < user.length - r.length;i++){
        n+= "*";
    };

    return user + n + domain;
}

export function hideMaskHalf(cell: string){
    let r = cell.substring(0, cell.length / 2), n = "";

    for(let i = 0; i < cell.length - r.length; i++){
        n+= "*";
    }

    return r + n;
}