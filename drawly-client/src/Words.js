export default function Words({words,selectWord}) {
  return (
    <div className="words-container">
      {words.map((word)=><button className="word" onClick={()=>
        {
          selectWord(word)
        }}>{word}</button>)}
    </div>
  );
}