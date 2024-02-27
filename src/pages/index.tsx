import Image from "next/image";
import { useEffect, useState, useRef, useCallback, SetStateAction } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

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
  const [myCards, setMyCards]: [myCards: any, setMyCards: any] = useState();


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

  //招待ナンバー参加者の処理
  useEffect(() => {
    if (inviteId !== 0) {
      socket.emit("getRoomId", inviteId)
    }
  }, [inviteId])

  return (
    <main>
      <h1 className="text-center py-8 text-2xl">オンライン大富豪</h1>
      {username ?
        roomId ?
          startingGame ? <>
            <p>Player</p>
            <div className="flex gap-x-4">
              {playerNames ? roomMember.map((id: string) => {
                console.log(id)
                return <>
                  <div className="p-4 border-solid border-2">
                    <p className="text-lg">{playerNames[id]}</p>
                  </div>
                </>
              }) : <></>}
            </div>
            <div className="flex">
              {myCards ?
                <>
                  {myCards.map((card: any) => {
                    return <>
                      <div>
                        <p className="text-2xl"><Suit suit={card.suit} /></p>
                        <p className="text-lg">{card.num}</p>
                      </div>
                    </>
                  })}
                </>
                : <></>}
            </div>
          </> : <>
            <div className="p-4">
              <div className="flex gap-x-4">
                <h1 className="mb-4 text-2xl">{roomSettings.creater}の部屋</h1>
                <p className="text-xl">{username}で参加中</p>
              </div>
              <p>{roomMember.length}人のPlayerが参加</p>
              <div className="flex gap-x-4">
                <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" onClick={() => { socket.emit("getInviteNumber", roomId) }}>招待ナンバーを取得</button>
                <button className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900" onClick={() => { socket.emit("gameStart", roomId) }}>ゲームを開始</button>
                <p>{alreadyStart}</p>
              </div>
              <p className="text-2xl">{getInviteNumber}</p>

              <p className="text-slate-300">roomId : {roomId} , sid : {socket.id}</p>
              <div>
                {roomMember.map((id: string) => {
                  console.log(id)
                  return <><p className="text-slate-300">{id}</p></>
                })}
              </div>
            </div>
          </> : <>
            <div className="p-8">
              <p>招待ナンバー</p>
              <InviteNumber setValue={setInviteId} />
              {inviteError}
              <hr className="my-4 " />
              <RuleCheckBox socket={socket} creater={username} />
            </div>
          </> : <>
          <div className="flex place-content-center">
            <p><label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ユーザーネーム</label> <input id="username" type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => { setInput_username(e.target.value) }} value={input_username} /></p>
          </div>
          <p className="text-center py-4"><button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => { if (input_username) { setUsername(input_username) } }}>ログイン</button></p>
        </>}
    </main>
  );
}
