import { useEffect, useState, useRef } from "react";

export default function Main(props: { setValue: (arg0: number) => void; }) {
    const [inviteNumber, setInviteNumber] = useState();
    const oneRef = useRef<HTMLInputElement>(null);
    const twoRef = useRef<HTMLInputElement>(null);
    const threeRef = useRef<HTMLInputElement>(null);
    const fourRef = useRef<HTMLInputElement>(null);
    return <><div className="flex gap-x-4">
        <input ref={oneRef} className="border-solid border-2 p-4 outline-none text-center" size={1} onInput={() => { twoRef.current?.focus() }} type="text" />
        <input ref={twoRef} className="border-solid border-2 p-4 outline-none text-center" onInput={() => { threeRef.current?.focus() }} size={1} type="text" />
        <input ref={threeRef} className="border-solid border-2 p-4 outline-none text-center" onInput={() => { fourRef.current?.focus() }} size={1} type="text" />
        <input ref={fourRef} className="border-solid border-2 p-4 outline-none text-center" onInput={() => { props.setValue(Number(`${oneRef.current?.value}${twoRef.current?.value}${threeRef.current?.value}${fourRef.current?.value}`)) }} size={1} type="text" />
    </div></>
}