module.exports= class Room{
    constructor(id,owner)
    {
        this.players=new Map()
        this.id=id
        this.owner=owner
        this.gameStarted=false
        this.drawer=null
        this.wordtoDraw=null
        this.wordChoosingTimer=null
        this.roundTimer=null
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
        return this.drawer
    }
}