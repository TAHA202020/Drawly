export default function PlayerPoints({ playerPoints }) 
{
    console.log(playerPoints)
    return (
        <div className="player-points">
            
            <div className="points-container">
            <h1>Round Points:</h1>
            <div className="points">
            {playerPoints.map(([id,playername,points]) => (
                <div key={id} className="flex justify-between items-center">
                    <div>{playername} :</div>
                    <div style={{color:points>0?"green":"red"}}>+{points}</div>
                </div>
            ))}
            </div>
            </div>
        </div>
    );
}