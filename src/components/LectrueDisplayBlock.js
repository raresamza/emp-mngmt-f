import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import qs from 'qs';
import userService from '../service/UserService'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import { useCookies } from 'react-cookie';
import jwtDecode from "jwt-decode";

const LectrueDisplayBlock = ({ lectureZustand, courseZustand }) => {

    const [cookies] = useCookies(['cookie-name']);
    const [role, setRole] = useState("STUDENT")

    const [solutionCode, setSolutionCode] = useState("public class Main {\n" +
        "\tpublic static void main( String args[]) {\n" +
        "\t\tSystem.out.println(\"Hello world\");\n\t}\n" +
        "}\n");
    const [testCode, setTestCode] = useState();

    const [loading, setLoading] = useState(false)
    const [loadingTest, setLoadingTest] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const role = (await userService.getUserByEmail(jwtDecode(cookies.jwt).sub)).data
                setRole(role.role)
                console.log(role.role)
            } catch (err) {
                console.log(err)
            }
        };
        fetchData();
    }, [cookies.jwt, loading])



    function onChange(newValue, e) {
        console.log(JSON.stringify(solutionCode))
        setSolutionCode(newValue)
    }
    function onChangeTest(newValue, e) {
        console.log(JSON.stringify(testCode))
        setTestCode(newValue)
    }



    const postTest = async (e) => {
        e.preventDefault();
        setLoadingTest(true)
        let header
        if (lectureZustand === null) {
            header = courseZustand.lectures[0].header
            console.log(courseZustand.lectures[0].header)
        } else {
            header = lectureZustand.header
            console.log(lectureZustand.header)
        }
        let addTestDTO = {
            "coruseCode": courseZustand.courseCode,
            "lectureHeader": header,
            "testCode": testCode
        }
        console.log(addTestDTO)

        await userService.postTests(addTestDTO).then((response) => {
            console.log(response.data)
        }).catch((error) => {
            console.log(error)
            setLoadingTest(false)
        })
        setLoadingTest(false)
    }

    const handleClick = async (e) => {
        e.preventDefault();
        // var data = {
        //     'code': 'val = int(input("Enter your value: ")) + 5\nprint(val)',
        //     'language': 'py',
        //     'input': '7'
        // };
        // await axios.post("https://api.codex.jaagrav.in", data, {
        //     headers: {
        //         'content-type': 'application/x-www-form-urlencoded',
        //     },
        // }).then((response) => {
        //     console.log(response.data)
        // }).catch((error) => {
        //     console.log(error)
        // })
        // console.log(data)
        setLoading(true)
        let data = {
            source_code: solutionCode,
            "language_id": 91,
            "stdin": "world"
        }

        await axios.post("https://judge0-ce.p.rapidapi.com/submissions", data, {
            headers: {
                'X-RapidAPI-Key': '427d6c1267mshae7fe963ae0886cp106d18jsn5992b865ed82',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'content-type': 'application/json'
            },
        }).then((response) => {
            axios.get("https://judge0-ce.p.rapidapi.com/submissions/" + response.data.token, {
                headers: {
                    'X-RapidAPI-Key': '427d6c1267mshae7fe963ae0886cp106d18jsn5992b865ed82',
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                },
            }).then((response) => {
                console.log(response.data.stdout)
            }).catch((error) => {
                setLoading(false)
                console.log(error)
            })
        }).catch((error) => {
            setLoading(false)
            console.log(error)
        });
        setLoading(false)
    }

    let value = "class Main {\n" + "\tpublic static void main( String args[]) {\n" + "\tSystem.out.println(\"Hello world\");\n\t}\n" + "}\n"



    return (

        <>
            <div className=' px-44'>

                {/* {console.log(courseZustand, "COURSE")} */}
                {lectureZustand !== null ? <h1 className='py-4  text-3xl font-semibold'>{lectureZustand.header}</h1> : <h1 className='py-4  text-3xl font-semibold'>{courseZustand.lectures[0].header}</h1>}
                {lectureZustand !== null ? <p className='pb-4' >{lectureZustand.content}</p> : <p className='pb-4' >{courseZustand.lectures[0].content}</p>}
                {lectureZustand !== null ? <h1 className='py-4  text-3xl font-semibold'>{lectureZustand.problemHeader}</h1> : <h1 className='py-4  text-3xl font-semibold'>{courseZustand.lectures[0].problemHeader}</h1>}
                {lectureZustand !== null ? <p className='pb-4' >{lectureZustand.problemContent}</p> : <p className='pb-4' >{courseZustand.lectures[0].problemContent}</p>}
                {role === "STUDENT" ?
                    <div>
                        <h1 className='pb-4 font-semibold'>Test output</h1>
                        <textarea spellCheck={false} readOnly={true} className='bg-black  w-full rounded-lg decoration-none border-none outline-none h-[800px] resize-none text-white px-4 py-4'></textarea>
                    </div>
                    :
                    <div>
                        <h1 className='pb-4 font-semibold'>Write tests</h1>
                        <AceEditor
                            mode="java"
                            theme="dracula"
                            onChange={(e) => {
                                onChangeTest(e);
                            }}
                            height='800px'
                            width='100%'
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                fontSize: 14,
                                showPrintMargin: false,
                            }}
                            value={testCode}
                            className="solutuionCode"
                            style={{ backgroundColor: 'black', color: 'white', borderTopRightRadius: '10px', borderTopLeftRadius: '10px' }}
                        />
                        <div className='bg-[#282A36] h-16 px-4 rounded-b-lg flex justify-end items-center  '>
                            {
                                loadingTest === false ? <button onClick={(e) => postTest(e)} className="bg-green-600 rounded-lg h-12  w-36 align-left text-white float-right hover:bg-green-700  ">
                                    <span className="text-lg mr-3 ">Upload Tests</span> <FontAwesomeIcon icon={faPlay} />
                                </button>
                                    : <button className=" bg-green-600 rounded-lg h-12  w-36 align-left text-white float-right hover:bg-green-700 flex justify-center ">
                                        <svg className=" h-5 w-5 my-auto animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </button>
                            }
                        </div>
                    </div>
                }
                {/* <textarea spellCheck={false} readOnly={true} className='bg-black  w-full rounded-lg decoration-none border-none outline-none h-[800px] resize-none text-white px-4 py-4'></textarea> */}
                <h1 className='font-semibold pb-4'>Solution</h1>
                <div className='grid grid-cols-1 grid-rows mb-10'>
                    {/* <textarea spellCheck={false} className='bg-black  w-full rounded-t-lg decoration-none border-none outline-none h-[800px] resize-none text-white px-4 py-4'></textarea> */}
                    <AceEditor
                        mode="java"
                        theme="dracula"
                        onChange={(e) => {
                            onChange(e);
                        }}
                        height='800px'
                        width='100%'
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            fontSize: 14,
                            showPrintMargin: false,
                        }}
                        value={solutionCode}
                        className="solutuionCode"
                        style={{ backgroundColor: 'black', color: 'white', borderTopRightRadius: '10px', borderTopLeftRadius: '10px' }}
                    />
                    <div className='bg-[#282A36] h-16 px-4 rounded-b-lg flex justify-end items-center  '>
                        {
                            loading === false ? <button onClick={(e) => handleClick(e)} className="bg-green-600 rounded-lg h-12  w-36 align-left text-white float-right hover:bg-green-700  ">
                                <span className="text-lg mr-3 ">Run</span> <FontAwesomeIcon icon={faPlay} />
                            </button>
                                : <button className=" bg-green-600 rounded-lg h-12  w-36 align-left text-white float-right hover:bg-green-700 flex justify-center ">
                                    <svg className=" h-5 w-5 my-auto animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </button>
                        }
                    </div>
                </div>
                {/* <AceEditor
                    mode="java"
                    theme="dracula"
                    onChange={(e) => {
                        onChange(e);
                    }}
                    width='100%'
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        fontSize: 14,
                        showPrintMargin: false,
                    }}
                    value={value}
                    className="class"
                    style={{ backgroundColor: 'black', color: 'white', borderRadius: '10px' }}
                /> */}
            </div>

        </>
    )
}

export default LectrueDisplayBlock