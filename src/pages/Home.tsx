import { Button } from "flowbite-react"
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import userInfoAtom from "../state/userInfo";
import { useState } from "react";
import { Alert } from 'flowbite-react';
import { HiInformationCircle } from 'react-icons/hi';

function Home() {
    const navigate = useNavigate();
    const [_, setUserInfo] = useRecoilState(userInfoAtom);
    const [username, setUsername] = useState("");
    const [showAlert, setShowAlert] = useState(false);


    function routeToPlanner() {
        setShowAlert(false)
        if (username == '') {
            setShowAlert(true)
            setTimeout(hideAlert,4000)
            return 
        }
        setUserInfo(username)
        navigate("/planner");
    }


    function createNewPlanner() {
        setShowAlert(false)
        console.log(username)
        if (username == '') {
            setShowAlert(true)
            setTimeout(hideAlert,4000)
            return 
        }
        setUserInfo(username)
        navigate("/planner");
    }


    const onChange = (event: any) => {
        setUsername(event.target.value);
    };

    const hideAlert=()=>{
        setShowAlert(false)

    }



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
                                    <img className="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="" />
                                </div>

                                <p className="mt-3 text-gray-500 dark:text-gray-300">Join Plan.it board</p>
                            </div>

                            <div className="mt-8">
                                <form>
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Your Name</label>
                                        <input type="text" value={username} onChange={onChange} name="name" id="name" placeholder="Godwin Pinto" className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>
                                    <div className="mt-6"></div>
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Board Code</label>
                                        <input type="code" name="code" id="code" placeholder="XXXXXXX" className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                                    </div>

                                    <div className="mt-6">
                                        <Button color="blue" className="w-full" onClick={routeToPlanner}>
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
                                        <Button color="dark" className="w-full" onClick={createNewPlanner}>
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
                                                        Oops!
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