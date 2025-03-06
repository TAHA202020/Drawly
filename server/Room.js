const fetch = require("node-fetch")


module.exports= class Room{
    constructor(id,owner)
    {
        this.players=new Map()
        this.id=id
        this.owner=owner
    }
    PlayerJoin(id,username)
    {
        this.players.set(id,username)
    }
}