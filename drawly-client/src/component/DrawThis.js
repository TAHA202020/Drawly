export default function DrawThis({word}) 
{
    return (<div className="flex justify-center items-center flex-col bg-white">
        <p className="text-sm font-normal">Draw This :</p>
        <p className="font-bold text-2xl tracking-wide">{word}</p>
    </div>)
}