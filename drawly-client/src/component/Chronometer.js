import clock from '../assets/clock.gif'

export default function Chronometer({time}) 
{
    if(time<0)
        {
            return null
        }
    return (
        <div className="flex justify-center items-center text-black relative bg-white">
            <img  src={clock} alt='clock'/>
            <p className='absolute font-bold'>{time}</p>
        </div>
    );
}