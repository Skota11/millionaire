import Image from "next/image";
import { useEffect, useState, useRef, useCallback, SetStateAction } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";

//components
import InviteNumber from "../components/invitenumber";
import RuleCheckBox from "../components/ruleCheckBox"

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

  //State-ゲーム
  const [startingGame, setStartingGame] = useState(false);

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
    setRoomId(msg.id)
    setRoomSettings(msg.roomSettings)
    toast.info(`${msg.username}が参加しました`)
  }, []);

  const userLeaveEventHandler = useCallback((msg: any) => {
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

  useEffect(() => {
    socket.on("Join", userJoinEventHandler)
    return () => { socket.off('Join', userJoinEventHandler); }
  }, [])
  useEffect(() => {
    socket.on("Leave", userLeaveEventHandler)
    return () => { socket.off("Leave", userLeaveEventHandler) }
  }, [])
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

          </> : <>
            <h1 className="text-center mb-4 text-2xl">{roomSettings.creater}の部屋</h1>
            <div className="flex place-content-center gap-x-8">
              <p className="py-2.5">{username}で参加中</p>
              <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" onClick={() => { socket.emit("getInviteNumber", roomId) }}>招待ナンバーを取得</button>
            </div>
            <p className="text-center text-2xl">{getInviteNumber}</p>
            <p className="text-slate-300">roomId : {roomId} , sid : {socket.id}</p>
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
