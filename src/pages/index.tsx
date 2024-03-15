import Link from "next/link";

export default function Home() {
    return (
        <main>
            <h1 className="text-center text-2xl py-8">オンライン大富豪</h1>
            <div className="flex place-content-center">
                <Link className="border-solid border-2 p-4 text-center" href="/play">プレイする</Link>
            </div>
        </main>
    );
}
