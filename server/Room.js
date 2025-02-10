const fetch = require("node-fetch")


module.exports= class Room{
    constructor(id,owner)
    {
        this.timeOut=null;
        this.id=id
        this.owner=owner
        this.clients=new Map()
    }
    async getRandomWords(limit) {
        let data=await fetch("https://random-word-api.herokuapp.com/word?number="+limit)
        data=await data.json()
        return data
    }
    setWordForRound(word)
    {
        this.word=word
    }
    removeClient(id)
    {
        this.clients.delete(id)
        if(this.clients.size==0)
        {
            return null
        }
        if(this.owner==id)
        {
            this.owner=this.clients.keys().next().value
            return this.owner
        }
        return this.owner

    }
    getDrawer()
    {
        this.drawer=this.clients.keys().next().value
        return this.drawer
    }
    createTimeout(callback,time)
    {
        this.timeOut=setTimeout(callback,time)
    }
}