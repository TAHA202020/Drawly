module.exports= class Room{
    constructor(id,owner)
    {
        this.PlayerPoints=new Map();
        this.maxRoundTimer=90
        this.maxWordPickingTimer=15
        this.players=new Map();
        this.maxPlayers=8;
        this.id=id;
        this.owner=owner;
        this.gameStarted=false;
        this.drawer=null;
        this.wordtoDraw=null;
        this.wordChoosingTime=10;
        this.roundTime=0;
        this.wordChoosingTimer=null;
        this.roundTimer=null;
        this.NumberOfRounds=15;
        this.roundCounter=1;
        this.wordstoChoose=[];
        this.playerGuessed=0;
    }
    setGameStarted(value)
    {
        this.gameStarted=value
    }
    PlayerJoin(id,username)
    {
        this.players.set(id,{username:username,points:0})
    }
    PlayerLeave(id)
    {
        this.players.delete(id)
        if(this.owner===id)
        {
            this.owner=Array.from(this.players.keys())[0]
            this.maxPlayers=8
            return this.owner
        }
        return null;
    }
    getPlayersArray()
    {
        return [...this.players].map(([id, { username, points }]) => [id, username, points])
    }
    



    randomDrawer()
    {
        this.PlayerPoints=new Map()
        let keys=Array.from(this.players.keys())
        this.drawer=keys[Math.floor(Math.random()*keys.length)]
        this.wordstoChoose=["potato","car","lighter"]
        this.wordtoDraw=null
        this.wordChoosingTime=11
    }
    setWordToDraw(word)
    {
        this.wordstoChoose=[]
        this.wordtoDraw=word
    }
    NextRound()
    {
        this.playerGuessed=0
        this.roundCounter++
        return true
    }
    guessedRight(id)
    {
        this.playerGuessed++;
        let points=this.calculatePoints(this.playerGuessed,this.players.size,this.roundTime,this.maxRoundTimer)
        this.PlayerPoints.set(id,{username:this.players.get(id).username,points:points})
        let oldPlayerStats=this.players.get(id);
        let oldPlayerPoints=oldPlayerStats.points
        this.players.set(id,{...oldPlayerStats,points:oldPlayerPoints+points})
        return points;
    }
    calculatePoints(position, totalPlayers, timeLeft, totalTime, basePoints = 100, bonusPoints = 50) {
        let timeBonus = (timeLeft / totalTime) * bonusPoints;
        let positionMultiplier = 1 - (position - 1) / totalPlayers;
        let points = (basePoints + timeBonus) * positionMultiplier;
        return Math.round(points);
    }
    resetRoom()
    {
        clearInterval(this.wordChoosingTimer)
        clearInterval(this.roundTimer)
        this.PlayerPoints=new Map();
        this.maxRoundTimer=90
        this.maxWordPickingTimer=15
        this.maxPlayers=8;
        this.gameStarted=false;
        this.drawer=null;
        this.wordtoDraw=null;
        this.wordChoosingTime=0;
        this.roundTime=0;
        this.wordChoosingTimer=null;
        this.roundTimer=null;
        this.NumberOfRounds=15;
        this.roundCounter=1;
        this.wordstoChoose=[];
        this.playerGuessed=0;
    }
}