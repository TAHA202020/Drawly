export default function DrawThis({word}) 
{
    return (<div className="flex justify-center items-center flex-col bg-white">
        <p className="text-md font-normal">Draw This :</p>
        <p className="font-bold text-md tracking-wide roboto-font">{word}</p>
    </div>)
}