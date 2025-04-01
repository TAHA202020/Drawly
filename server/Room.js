const Queue =require("./Queue")
const words = require('./words');
module.exports= class Room{
    constructor(id,owner)
    {
        this.abortController = new AbortController();
        this.showingRoundCounter=false;
        this.showingPlayerPoints=false;
        this.drawerChoosing=false;
        this.turnsQueue=null;
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
        this.wordChoosingTime=0;
        this.roundTime=0;
        this.wordChoosingTimer=null;
        this.roundTimer=null;
        this.NumberOfRounds=3;
        this.roundCounter=0;
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
    

    getRandomWords(numWords = 3) {
    const keys = Object.keys(words); 
    const randomWords = [];

    for (let i = 0; i < numWords; i++) {
        const randomIndex = Math.floor(Math.random() * keys.length);
        const randomWord = keys[randomIndex];
        randomWords.push(randomWord);
        keys.splice(randomIndex, 1);
    }

    return randomWords;
    }
    PlayerLeave(id)
    {
        this.players.delete(id)
        if(this.Queue)
            this.Queue.remove(id)
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
    emptyPlayerPoints()
    {
        return [...this.players].map(([id, { username }]) => [id, username, 0])
    }


    nextDrawer()
    {
        this.playerGuessed=0
        this.PlayerPoints=new Map()
        this.drawer=this.Queue.dequeue()
        this.wordstoChoose=this.getRandomWords()
        this.wordtoDraw=null
        this.drawerChoosing=true
    }
    setWordToDraw(word)
    {
        this.wordstoChoose=[]
        this.wordtoDraw=word
    }
    NextRound()
    {
        if(this.roundCounter>=this.NumberOfRounds)
        {
            return false
        }
        return true
    }
    guessedRight(id)
    {
        if(this.PlayerPoints.has(id))
            return null;
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
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        this.resetPlayersPoints()
        this.PlayerPoints=new Map();
        this.maxRoundTimer=90
        this.maxWordPickingTimer=15
        this.maxPlayers=8;
        this.gameStarted=false;
        this.drawerChoosing=false;
        this.showingPlayerPoints=false;
        this.showingRoundCounter=false;
        this.drawer=null;
        this.wordtoDraw=null;
        this.wordChoosingTime=0;
        this.roundTime=0;
        this.wordChoosingTimer=null;
        this.roundTimer=null;
        this.NumberOfRounds=3;
        this.roundCounter=0;
        this.wordstoChoose=[];
        this.playerGuessed=0;
        this.showingRoundCounter=false;
        this.showingPlayerPoints=false;
        
    }
    resetPlayersPoints()
    {
        this.players.forEach((_, key) => {
            if (!this.PlayerPoints.has(key)) {
              this.PlayerPoints.set(key, {username: this.players.get(key).username, points: 0});
            }
          });
    }
    getRoundPoints()
    {
        this.players.forEach((_, key) => {
            if (!this.PlayerPoints.has(key)) {
              this.PlayerPoints.set(key, {username: this.players.get(key).username, points: 0});
            }
          });

        return [...this.PlayerPoints].map(([id, { username, points }]) => [id, username, points])
    }
    startRound()
    {
        this.showingRoundCounter=true
        this.Queue=new Queue(this.players)
        this.roundCounter++
    }
    nextTurn()
    {
        if(this.Queue.isEmpty())
        {
            return false
        }
        return true
    }
}