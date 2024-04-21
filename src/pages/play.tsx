import Image from "next/image";
import { useEffect, useState, useRef, useCallback, SetStateAction } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { motion } from "framer-motion"
import { TbCardsFilled } from "react-icons/tb";

//components
import InviteNumber from "../components/invitenumber";
import RuleCheckBox from "../components/ruleCheckBox"
import Suit from "../components/suit";

export default function Home() {
  //State-ユーザー関係
  const [username, setUsername] = useState("");
  const [input_username, setInput_username] = useState("");
  const [roomId, setRoomId] = useState("")

  //State-招待ナンバー
  const [inviteId, setInviteId] = useState(0);
  const [inviteError, setInviteError] = useState("")

  //State-部屋Setting
  const [roomSettings, setRoomSettings]: [roomSettings: any, setRoomSettings: any] = useState({ creater: "test" })
  const [getInviteNumber, setGetInviteNumber] = useState()
  const [roomMember, setRoomMember]: [roomMember: any, setRoomMember: any] = useState([])

  //State-ゲーム
  const [startingGame, setStartingGame] = useState(false);
  const [playerNames, setPlayerNames]: [playerNames: any, setPlayerNames: any] = useState()
  const [cardsNumber, setCardsNumber]: [cardsNumber: any, setCardsNumber: any] = useState();
  const [myCards, setMyCards]: [myCards: any, setMyCards: any] = useState();
  const [selectCards, setSelectCards]: [selectCards: any, setSelectCards: any] = useState([])
  const [turn, SetTurn] = useState("");
  const [field, setField]: [field: any, setField: any] = useState([]);
  const [pair, setPair]: [pair: any, setPair: any] = useState(1);
  const [winThrough, setWinThrough]: [winThrough: any, setWinThrough: any] = useState([])

  //State-その他
  const [alreadyStart, setAlreadyStart] = useState("");

  //socket.io
  const ioHost: any = process.env.NEXT_PUBLIC_HOST
  const [socket, _] = useState(() => io(ioHost))

  useEffect(() => {
    socket.on("NewRoomId", (msg) => {
      if (username !== "") {
        console.log(username, msg)
        socket.emit("joinRoom", { roomId: msg.id, username: username })
      }
    })
  }, [username])

  const userJoinEventHandler = useCallback((msg: any) => {
    console.log(msg)
    setRoomId(msg.id)
    setRoomSettings(msg.roomSettings)
    toast.info(`${msg.username}が参加しました`)

    socket.emit("getRoomMember", msg.id)
  }, []);

  const userLeaveEventHandler = useCallback((msg: any, id: string) => {
    socket.emit("getRoomMember", id)
    toast.info(`${msg.username}が退出しました`)
  }, [])
  const getInviteNumberEventHandler = useCallback((msg: any) => {
    setGetInviteNumber(msg)
  }, [])

  const getRoomIdEventHandler = useCallback((msg: any, username: string) => {
    if (msg == "invalidNumber") {
      setInviteError("招待ナンバーが間違っています")
    } else {
      if (username !== "") {
        socket.emit("joinRoom", { roomId: msg, username: username })
      }
    }
  }, [])
  const getStartGameEventHandler = useCallback((msg: any, id: string) => {
    if (msg.already) {
      setAlreadyStart("すでにゲームは開始されています")
    } else if (msg.not) {
      setAlreadyStart("大富豪は一人でプレイできません")
    } else {
      setStartingGame(true);
      toast.info("ゲームを開始します")
      socket.emit("getPlayerName", id)
      socket.emit("getCardsNumber")
    }
  }, [])

  const getPlayerNameEventHandler = useCallback((msg: any) => {
    setPlayerNames(msg);
  }, [])

  const getRoomMemberEventHandler = useCallback((msg: any) => {
    console.log(msg)
    setRoomMember(msg);
  }, [])

  const getCardsEventHandler = useCallback((msg: any) => {
    const sorted = msg.sort((first: any, second: any) => first.num - second.num);
    setMyCards(sorted)
  }, [])
  const getCardsNumberEventHandler = useCallback((msg: any) => {
    setCardsNumber(msg)
  }, [])
  const getTurnEventHandler = useCallback((msg: string) => {
    SetTurn(msg);
    socket.emit("getCardsNumber")
  }, [])
  const getTurnResetEventHandler = useCallback((msg: string) => {
    setField([])
  }, [])
  const getPlayEventHandler = useCallback((msg: any) => {
    if (!msg.pass) {
      setField(msg.cards)
      if (msg.start) {
        setPair(msg.length)
        console.log(pair)
      }
    }
    setSelectCards([])
  }, [])

  const getWinThroughEventHandler = useCallback((msg: any) => {
    const temp = [...winThrough]
    temp.push(msg)
    setWinThrough(temp)
  }, [])

  const getFinishGameEventHandler = useCallback(() => {
    setStartingGame(false)
    setWinThrough([])
    setPair(1);
    setField([])
    SetTurn("")
    setSelectCards([])

  }, [])

  useEffect(() => {
    socket.on("Join", userJoinEventHandler)
    return () => { socket.off('Join', userJoinEventHandler); }
  }, [])
  useEffect(() => {
    if (roomId !== "") {
      socket.on("Leave", (msg) => { userLeaveEventHandler(msg, roomId) })
      return () => { socket.off("Leave", userLeaveEventHandler) }
    }
  }, [roomId])
  useEffect(() => {
    socket.on("inviteNumber", getInviteNumberEventHandler)
    return () => { socket.off("inviteNumber", getInviteNumberEventHandler) }
  }, [])
  useEffect(() => {
    if (username !== "") {
      socket.on("roomId", (msg) => { getRoomIdEventHandler(msg, username) })
      return () => { socket.off("roomId", getRoomIdEventHandler) }
    }
  }, [username])
  useEffect(() => {
    socket.on("getRoomMember", getRoomMemberEventHandler)
    return () => { socket.off("getRoomMember", getRoomMemberEventHandler) }
  }, [])
  useEffect(() => {
    if (roomId !== "") {
      socket.on("gameStart", (msg) => { getStartGameEventHandler(msg, roomId) })
      return () => { socket.off("gameStart", getStartGameEventHandler) }
    }
  }, [roomId])
  useEffect(() => {
    socket.on("getPlayerName", getPlayerNameEventHandler)
    return () => { socket.off("getPlayerName", getPlayerNameEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("getCards", getCardsEventHandler)
    return () => { socket.off("getCards", getCardsEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("getCardsNumber", getCardsNumberEventHandler)
    return () => { socket.off("getCardsNumber", getCardsNumberEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("Turn", getTurnEventHandler)
    return () => { socket.off("Turn", getTurnEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("TurnReset", getTurnResetEventHandler)
    return () => { socket.off("TurnReset", getTurnResetEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("Play", getPlayEventHandler)
    return () => { socket.off("Play", getPlayEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("winThrough", getWinThroughEventHandler)
    return () => { socket.off("winThrough", getWinThroughEventHandler) }
  }, [])
  useEffect(() => {
    socket.on("FinishGame", getFinishGameEventHandler)
    return () => { socket.off("FinishGame", getFinishGameEventHandler) }
  }, [])


  //招待ナンバー参加者の処理
  useEffect(() => {
    if (inviteId !== 0) {
      socket.emit("getRoomId", inviteId)
    }
  }, [inviteId])

  return (
    <main className="p-8">
      <div className="">
        <h1 className="text-2xl">大富豪</h1>
        <div className="flex gap-x-4">
          {username ? <p>ニックネーム {username}</p> : <></>}
        </div>
      </div>
      {username ?
        roomId ?
          startingGame ? <>
            <div className="flex place-content-center">
              <div>
                <p className="mt-4">Player</p>
                <div className="flex gap-x-4">
                  {playerNames && cardsNumber ? roomMember.map((id: string) => {
                    let TurnedBorder = "border-slate-500"
                    if (turn == id) {
                      TurnedBorder = "border-orange-700"
                      console.log("set")
                    }
                    return <>
                      <div>
                        <div className={`p-2 border-solid border-b-4 ${TurnedBorder}`}>
                          <p className="text-lg">{playerNames[id]}  <TbCardsFilled className="inline" /> {cardsNumber[id]}</p>

                        </div>
                        {winThrough.includes(id) ? <><p className="text-center my-2">勝ち抜け</p></> : <></>}
                      </div>

                    </>
                  }) : <></>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap place-content-center gap-x-1 my-4">
              {field?.map((card: any) => {
                return <>
                  <div className={`p-4 rounded-sm border-solid`}>
                    <p className="text-2xl text-center"><Suit suit={card.suit} /></p>
                    {card.num == 0 ? <></> : <p className="text-lg text-center">{card.num}</p>}
                  </div>
                </>
              })}
            </div>
            <div className="flex flex-wrap place-content-center gap-x-1 my-4">
              {myCards ?
                <>
                  {myCards.map((card: any) => {
                    let selectedBorder = "border-slate-500 border-2"
                    if (selectCards.includes(card)) {
                      selectedBorder = "border-sky-700 border-4"
                      console.log("set")
                    }
                    return <>
                      <div className={`cursor-pointer p-4 rounded-sm border-solid  ${selectedBorder}`} onClick={() => {
                        if (turn == socket.id) {
                          if (selectCards.length !== 0) {
                            console.log(selectCards, card)
                            if (selectCards.includes(card)) {
                              const temp = [...selectCards]
                              temp.splice(temp.indexOf(card), 1)
                              setSelectCards(temp);
                            } else {
                              if (selectCards[0].num == card.num || card.num == 0) {
                                const temp = [...selectCards]
                                temp.push(card)
                                setSelectCards(temp);
                              }
                            }
                          } else {
                            if (field.length == 0) {
                              const temp = [...selectCards]
                              temp.push(card)
                              setSelectCards(temp);
                            } else if (field[0].num == 0 && roomSettings["eight"] && card.num == 3 && card.suit == 4) {
                              socket.emit("Play", { sid: socket.id, pass: false, spade: true, cards: [{ num: 3, suit: 4 }] });
                            } else if ((field[0].num == 13 && card.num <= 2) || (field[0].num !== 0 && field[0].num <= 2 && (0 == card.num || (field[0].num < card.num && card.num <= 2))) || ((3 <= field[0].num && field[0].num <= 12) && (card.num == 0 || card.num == 1 || card.num == 2 || field[0].num < card.num))) {
                              const temp = [...selectCards]
                              temp.push(card)
                              setSelectCards(temp);
                            }
                          }
                        }
                      }}>
                        <p className="text-2xl"><Suit suit={card.suit} /></p>
                        {card.num == 0 ? <p className="text-lg text-center">J</p> : <p className="text-lg text-center">{card.num}</p>}
                      </div>
                    </>
                  })}
                </>
                : <></>}
            </div>
            {socket.id == turn ?
              <div className="flex place-content-center gap-x-4 my-4">
                <button className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900 " onClick={() => {
                  if (socket.id == turn) {
                    socket.emit("Play", { sid: socket.id, pass: true, spade: false });
                  }
                }}>パス</button>
                <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:bg-gray-800" disabled={(field.length === 0 && selectCards.length === 0) || (field.length !== 0 && selectCards.length !== pair)} onClick={() => {
                  if (socket.id == turn) {
                    socket.emit("Play", { sid: socket.id, cards: selectCards, start: field.length == 0, length: selectCards.length, pass: false, spade: false });
                  }
                }}>手札を出す</button>
              </div> : <></>}
          </> : <>
            <div className="mt-4">
              <div className="flex gap-x-4">
                <h1 className="mb-1 text-2xl">{roomSettings.creater}の部屋</h1>
              </div>
              <p>{roomMember.length}人が部屋に参加中です。</p>
              <div className="flex gap-x-4 my-4">
                <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" onClick={() => { socket.emit("getInviteNumber", roomId) }}>招待ナンバーを取得</button>
                <button className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900" onClick={() => { socket.emit("gameStart", roomId) }}>ゲームを開始</button>
                <p>{alreadyStart}</p>
              </div>
              <p className="text-4xl">{getInviteNumber}</p>

              <p className="text-slate-300">roomId : {roomId} , sid : {socket.id}</p>
              <div>
                {roomMember.map((id: string) => {
                  console.log(id)
                  return <><p className="text-slate-300">{id}</p></>
                })}
              </div>
            </div>
          </> : <>
            <div className="mt-4">

              <p>招待ナンバー</p>
              <InviteNumber setValue={setInviteId} />
              {inviteError}
              <hr className="my-4 " />
              <RuleCheckBox socket={socket} creater={username} />
            </div>
          </> : <>
          <div className="flex place-content-center">
            <p><label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ニックネーム</label> <input id="username" type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => { setInput_username(e.target.value) }} value={input_username} /></p>
          </div>
          <p className="text-center py-4"><button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => { if (input_username) { setUsername(input_username) } }}>プレイ</button></p>
        </>}
    </main>
  );
}
