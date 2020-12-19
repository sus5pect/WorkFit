var arr =[10,25,50,75,100];
const streakInc = async ()=>{
    console.log(arr)
    if(user.maxstreak==user.streak)
    {
        user.badges.push(String(user.maxstreak));
        let maxExit = false
        for(x in arr)
        {
            if(x>user.maxstreak)
            {
                user.maxstreak = x;
                maxExit=true;
                break;
            }
        }
        user.streak++;
        if(!maxExit)
        user.maxstreak = 100000000;

    }
    return user;
    
}

module.exports = streakInc;