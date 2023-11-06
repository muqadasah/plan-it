import { Button } from "flowbite-react"
import { useRecoilState } from "recoil";

import userInfoAtom from "../state/userInfo";
import { useEffect, useState } from "react";
import { Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';
import axios from "axios";
import boardInfoAtom from "../state/boardInfo";
import boardContentAtom from "../state/boardContent";

function Home() {
    const [userInfo, setUserInfo] = useRecoilState(userInfoAtom);
    const [boardInfo, setBoardInfo] = useRecoilState(boardInfoAtom);
    const [_, setBoardContent] = useRecoilState(boardContentAtom);
    const [showAlert, setShowAlert] = useState(false);
    const [isCreateLoading,setIsCreateLoading]=useState(false);
    const [isJoinLoading,setIsJoinLoading]=useState(false);


    async function routeToPlanner() {
        setShowAlert(false)
        if (userInfo == '') {
            setShowAlert(true)
            setTimeout(hideAlert,4000)
            return 
        }
        setIsJoinLoading(true);
        const response=await axios.post(import.meta.env.VITE_PLANIT_API_URL+'/space/join',{
            userFullname:userInfo,
            shortCode:boardInfo
        });

        if(response.status==200){
            setBoardContent(JSON.stringify(response.data.response.data))
            setTimeout(window.location.href='/planner',1000)
        }
        setIsJoinLoading(false);
    }


    const createNewPlanner=async()=> {
        setShowAlert(false)
        if (userInfo == '') {
            setShowAlert(true)
            setTimeout(hideAlert,4000)
            return 
        }
        setIsCreateLoading(true)
        const response=await axios.post(import.meta.env.VITE_PLANIT_API_URL+'/space/create',{
            userFullname:userInfo
        });

        if(response.status==200){
            setBoardInfo(response.data.response.data.space)
            setBoardContent(JSON.stringify(response.data.response.data))
            setTimeout(window.location.href='/planner',1000)
        }
        setIsCreateLoading(false)
    }


    const onChange = (event: any) => {
        setUserInfo(event.target.value);
    };

    const onChangeCode = (event: any) => {
        setBoardInfo(event.target.value);
    };

    const hideAlert=()=>{
        setShowAlert(false)

    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
    
        if (codeParam) {
            setBoardInfo(codeParam);
        }
      }, []);

    return (
        <>
            <div className="bg-white dark:bg-gray-900">
                <div className="flex justify-center h-screen">
                    <div className="hidden bg-cover lg:block lg:w-2/3" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1616763355603-9755a640a287?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)' }}>
                        <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
                            <div>
                                <h2 className="text-2xl font-bold text-white sm:text-3xl">Plan.it</h2>

                                <p className="max-w-xl mt-3 text-gray-300">
                                    Plan.it is a real-time collaborative tool helping you to plan various activities towards your goal or objectives
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
                        <div className="flex-1">
                            <div className="text-center">
                                <div className="flex justify-center mx-auto">
                                    <img className="w-auto h-24 sm:h-48" src="/logo.svg" alt="" />
                                </div>

                                <p className="mt-3 text-gray-900 dark:text-gray-300 text-xl font-bold">Join Plan.it board</p>
                            </div>

                            <div className="mt-8">
                                <form>
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200 font-bold">Your Name</label>
                                        <input type="text" value={userInfo} onChange={onChange} name="name" id="name" placeholder="Example: Godwin Pinto" className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div className="mt-6"></div>
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200 font-bold">Board Code</label>
                                        <input type="code" value={boardInfo} onChange={onChangeCode}  placeholder="XXXXXXX" className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                        <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only applicable, if you want to join existing board.</p>
                                    </div>

                                    <div className="mt-6">
                                        <Button color="blue" className="w-full" onClick={routeToPlanner} isProcessing={isJoinLoading}>
                                            Joing Existing board
                                        </Button>
                                    </div>
                                    <div className="mt-6">
                                        <div className="flex items-center justify-center">
                                            <div className="border-t border-gray-300 w-1/3"></div>
                                            <div className="px-2">OR</div>
                                            <div className="border-t border-gray-300 w-1/3"></div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button color="dark" className="w-full" onClick={createNewPlanner} isProcessing={isCreateLoading}>
                                            Create new board
                                        </Button>
                                    </div>

                                    {showAlert ?
                                        (<Alert
                                            color="failure"
                                            icon={HiInformationCircle}
                                        >
                                            <span>
                                                <p>
                                                    <span className="font-medium">
                                                        Oops!&nbsp;
                                                    </span>
                                                    Please enter username
                                                </p>
                                            </span>
                                        </Alert>
                                    ):''}
                                </form>

                                {/* <p className="mt-6 text-sm text-center text-gray-400">Don&#x27;t have an account yet? <a href="#" className="text-blue-500 focus:outline-none focus:underline hover:underline">Sign up</a>.</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Home