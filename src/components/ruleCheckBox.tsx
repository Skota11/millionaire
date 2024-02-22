import { useEffect, useState, useRef } from "react";

export default function Main(props: {
    creater: string;
    socket: any;
}) {
    const [joker, setJoker] = useState(true);
    const [eight, setEight] = useState(true);
    const [topDown, setTopDown] = useState(false);
    const [spadeReturn, setSpadeReturn] = useState(true);
    return <><div>
        <p className="text-lg my-2">ルール</p>
        <div className="flex">
            <div className="flex items-center h-5">
                <input id="joker" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={(e) => { setJoker(e.target.checked) }} checked={joker} />
            </div>
            <div className="ms-2 text-sm">
                <label htmlFor="joker" className="font-medium text-gray-900 dark:text-gray-300">2抜け・ジョーカー抜けの禁止</label>
                <p id="joker-text" className="text-xs font-normal text-gray-500 dark:text-gray-300">2またはジョーカーを含む手札で上がってはいけません</p>
            </div>
        </div>
        <div className="flex">
            <div className="flex items-center h-5">
                <input id="eight" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={(e) => { setEight(e.target.checked) }} checked={eight} />
            </div>
            <div className="ms-2 text-sm">
                <label htmlFor="eight" className="font-medium text-gray-900 dark:text-gray-300">8切り</label>
                <p id="eight-text" className="text-xs font-normal text-gray-500 dark:text-gray-300">8の手札が出されたとき、ターンが終了し手札を出した人から始めます</p>
            </div>
        </div>
        <div className="flex">
            <div className="flex items-center h-5">
                <input id="topDown" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={(e) => { setTopDown(e.target.checked) }} checked={topDown} />
            </div>
            <div className="ms-2 text-sm">
                <label htmlFor="topDown" className="font-medium text-gray-900 dark:text-gray-300">都落ち</label>
                <p id="topDown-text" className="text-xs font-normal text-gray-500 dark:text-gray-300">前回のゲームで大富豪となった人が誰かに負けたとき、大貧民になります</p>
            </div>
        </div>
        <div className="flex">
            <div className="flex items-center h-5">
                <input id="spade" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" onChange={(e) => { setSpadeReturn(e.target.checked) }} checked={spadeReturn} />
            </div>
            <div className="ms-2 text-sm">
                <label htmlFor="spade" className="font-medium text-gray-900 dark:text-gray-300">スペード3返し</label>
                <p id="spade-text" className="text-xs font-normal text-gray-500 dark:text-gray-300">ジョーカー単体が出されたとき、スペードの3の手札はジョーカーよりも強くなります</p>
            </div>
        </div>
        <button onClick={() => {
            if (props.creater !== "") {
                console.log(props.creater)
                props.socket.emit("createNewRoom", { joker: joker, eight: eight, topDown: topDown, spadeReturn: spadeReturn, creater: props.creater })
            }
        }} className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 my-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">部屋を作成</button>
    </div ></>
}