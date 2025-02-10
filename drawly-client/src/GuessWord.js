export default function GuessWord({length}) 
{
    return(<div className="word-todraw mb-[10px]">
    {Array(length)
        .fill()
        .map((_, index) => {
          
          return <h1 className="inline ml-[5px]">_</h1>; 
        })}
    </div>)
}