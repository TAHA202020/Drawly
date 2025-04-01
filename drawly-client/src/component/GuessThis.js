export default function GuessThis({wordLenght})
{
    return (<div className="flex justify-center items-center flex-col relative bg-white">
        <p className="text-md font-normal">Guess This :</p>
        <p className="font-black text-xl tracking-[10px] roboto-font">{"_".repeat(wordLenght)}</p>
        <p className="absolute top-[40%] right-0 translate-x-[150%] text-xs roboto-font">{wordLenght}</p>
    </div>)
}