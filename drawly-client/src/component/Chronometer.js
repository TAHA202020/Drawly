export default function Chronometer({time}) 
{
    if(time==0)
        {
            return null
        }
    return (
        
        <div className="flex justify-center items-center w-20 h-20 bg-gray-900 bg-opacity-80 text-white rounded-full text-2xl font-semibold">
        {time}
        </div>
    );
}