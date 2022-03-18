export function hideMaskMail(mail: string): string{
    let [user, domain] = mail.split('@'), c = Math.floor(user.length / 2), r = user.substring(0, c), n = "";

    for(let i = 0; i < user.length - r.length;i++){
        n+= "*";
    };

    return `${user.substring(0, c) + n}@${domain}`;
}

export function hideMaskHalf(cell: string){
    let c = cell.length,
        fair = Math.floor(70 * c / 100),
        diff = Math.floor(c - fair),
        i = Math.floor(diff / 2),
        n = "",
        pref = cell.substring(0, i),
        suff = cell.substring(fair + i, c);

    for(let i = 0; i < fair; i++){
        n+= "*";
    }

    return `${pref}${n}${suff}`;
}