const fetch = require("node-fetch")


module.exports= class Room{
    constructor(id,owner)
    {
        this.id=id
        this.owner=owner
    }
    async getRandomWords(limit) {
        let data=await fetch("https://random-word-api.herokuapp.com/word?number="+limit)
        console.log(data)
    }
    setWordForRound(word)
    {
        this.word=word
    }
}