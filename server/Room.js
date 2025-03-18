module.exports= class Room{
    constructor(id,owner)
    {
        this.players=new Map()
        this.id=id
        this.owner=owner
        this.gameStarted=false
        this.drawer=null
        this.wordtoDraw=null
        this.wordChoosingTime=10;
        this.roundTime=0;
        this.wordChoosingTimer=null
        this.roundTimer=null
        this.NumberOfRounds=15
        this.roundCounter=1
        this.wordstoChoose=[]
        this.playerGuessed=0
    }
    setGameStarted(value)
    {
        this.gameStarted=value
    }
    PlayerJoin(id,username)
    {
        this.players.set(id,username)
    }
    PlayerLeave(id)
    {
        this.players.delete(id)
        if(this.owner===id)
        {
            this.owner=Array.from(this.players.keys())[0]
            return this.owner
        }
        return null;
    }
    randomDrawer()
    {
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
    guessedRight()
    {
        this.playerGuessed++
    }
}