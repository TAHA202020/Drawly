export default function DrawThis({word}) 
{
    return (<div className="flex justify-center items-center flex-col">
        <p className="text-sm font-normal">Draw This :</p>
        <p className="font-bold text-xl tracking-wide">{word}</p>
    </div>)
}