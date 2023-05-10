'use client'
import type { NextPage } from "next";
import Head from "next/head";
import { useRef, useState } from "react";

const Home: NextPage = () => {
    const [loading, setLoading] = useState(false);
    const [problem, setProblem] = useState("");
    const [generatedAnswer, setGeneratedAnswer] = useState<String>("");

    const answerRef = useRef<null | HTMLDivElement>(null);

    const scrollToBios = () => {
        if (answerRef.current !== null) {
            answerRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const prompt = `Основываясь исключительно на жилищном кодексе РФ, ответь на следующий вопрос управляющей компании: "${problem}"`

    const generateAnswer = async (e: any) => {
        e.preventDefault();
        setGeneratedAnswer("");
        setLoading(true);
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // This data is a ReadableStream
        const data = response.body;
        if (!data) {
            return;
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            setGeneratedAnswer((prev) => prev + chunkValue);
        }
        scrollToBios();
        setLoading(false);
    };

    return (
        <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
                <p className="text-slate-500 mt-5"></p>
                <div className="max-w-xl w-full">
                    <div className="flex mt-10 items-center space-x-3">
                        <p className="text-left font-medium">
                            Опиши произошедшую ситуацию:
                        </p>
                    </div>
                    <textarea
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
                        placeholder={
                            "В подъезде прорвало трубу, которую обслуживает ресурсоснабжающая организация, в связи с чем был нанесен ущерб лестничной клетке, которую обслуживаю я. Могу ли я потребовать с нее деньги на ремонт?"
                        }
                    />

                    {!loading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            onClick={(e) => generateAnswer(e)}
                        >
                            Получить ответ &rarr;
                        </button>
                    )}
                    {loading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            disabled
                        >
                            ...
                        </button>
                    )}
                </div>
                <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
                <div className="space-y-10 my-10">
                    {generatedAnswer && (
                        <>
                            <div>
                                <h2
                                    className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                                    ref={answerRef}
                                >
                                    Ваш ответ:
                                </h2>
                            </div>
                            <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                                <div
                                    className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                                >
                                    <p>{generatedAnswer}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;