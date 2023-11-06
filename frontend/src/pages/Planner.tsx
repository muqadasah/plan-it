
import NavBar from "../components/NavBar";
import { SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AvatarStack from "../components/avatars/AvatarStack";
import LiveCursors from "../components/cursor/LiveCursors";
import { useSpace } from "@ably/spaces/dist/mjs/react";
import { useRecoilState } from "recoil";
import userInfoAtom from "../state/userInfo";
//import { getLocationColors } from "../utils/mockColors";
import { Button } from "flowbite-react";
import taskListAtom from "../state/taskList";
import 'react-data-grid/lib/styles.css';
import ReactFlow, { Background, BackgroundVariant, EdgeChange, Node, useReactFlow, Edge, Connection } from "reactflow";
import 'reactflow/dist/style.css';
import TaskCard from "../components/flow/TaskCard";
import useStore from "../state/taskStore";
import { useChannel } from "ably/react";
import "gantt-task-react/dist/index.css";
import { HiPlus, HiSave, HiDownload, HiUpload } from 'react-icons/hi';
import axios from "axios";
import CustomGantt from '../components/gantt/CustomGantt'
import boardContentAtom from "../state/boardContent";
import boardInfoAtom from "../state/boardInfo";

function Planner() {
    const [activeTab, setActiveTab] = useState("edit");
    const [userInfo,] = useRecoilState(userInfoAtom);
    const [text,] = useRecoilState(taskListAtom);
    const [curEdges, setCurEdges] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [milestones,] = useState([]);
    const [resources,] = useState([]);
    const removeEdge = useStore((state) => state.removeEdge);
    const removeNode = useStore((state) => state.removeNode);
    const updateNodeInfo = useStore((state) => state.updateNodeInfo);
    const updateNewEdge = useStore((state) => state.updateNewEdge);
    const setEdges = useStore((state) => state.setEdges);
    const setNodes = useStore((state) => state.setNodes);
    const [boardContent, setBoardContent] = useRecoilState(boardContentAtom);
    const [boardInfo] = useRecoilState(boardInfoAtom);
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();

    const [successMsg, setSuccessMsg] = useState('');
    const [failureMsg, setFailureMsg] = useState('');


    const updateNodeData = useStore((state) => state.updateNodeData);

    const edgeUpdateSuccessful = useRef(true);

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeUpdateSuccessful.current = true;
        updateNewEdge(oldEdge, newConnection)
    }, []);

    const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeUpdateSuccessful.current) {
            removeEdge(edge.id);
        }

        edgeUpdateSuccessful.current = true;
    }, []);

    const showSuccessMessage=(message:string)=>{
        setSuccessMsg(message);
        setTimeout(function(){setSuccessMsg('')},5000)
    }
    const showFailureMessage=(message:string)=>{
        setFailureMsg(message);
        setTimeout(function(){setFailureMsg('')},5000)
    }

    const exportData = () => {

        const planitData = {
            nodes,
            edges,
            milestones,
            resources
        }

        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(planitData)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "project.planit";

        link.click();
        showSuccessMessage('File exported')
    };

    const { channel } = useChannel("channel-plan-it-" + boardInfo, (message: any) => {
        if (message.name == "channel-plan-it-" + boardInfo) {
            if (message.data.type == 'new-node') {
                const nodeContent = JSON.parse(message.data.node)
                const isExisting = nodes.find((node: Node) => node.id === nodeContent.id);
                if (!isExisting)
                    reactFlowInstance.addNodes(nodeContent);

            } else if (message.data.type == 'node-title-change') {
                const nodeContent = JSON.parse(message.data.node)
                updateNodeInfo(nodeContent.id, nodeContent.editedTitle, nodeContent.startDate, nodeContent.endDate)

            } else if (message.data.type == 'remove-node') {
                const nodeContent = JSON.parse(message.data.node)
                removeNode(nodeContent.id)

            } else if (message.data.type == 'imported') {
                const nodeContent = JSON.parse(message.data.node)
                if (nodeContent.nodes) {
                    setNodes(nodeContent.nodes)
                    if (nodeContent.edges) {
                        setEdges(nodeContent.edges)
                    } else {
                        setEdges([])
                    }
                }
            }

            else if (message.data.type == 'update-edge') {
                const edgesArray = JSON.parse(message.data.node)
                setCurEdges(JSON.stringify(edgesArray))
                setEdges(edgesArray)
            } else if (message.data.type == 'load-latest') {
                const content = JSON.parse(boardContent);
                if (content.owner == userInfo) {
                    channel.publish("channel-plan-it-" + boardInfo, {
                        type: 'publish-latest', node: {
                            nodes: JSON.stringify(nodes),
                            edges: JSON.stringify(edges)
                        }
                    });
                }
            } else if (message.data.type == 'publish-latest') {
                const content = JSON.parse(boardContent);
                if (content.owner == userInfo) {
                    return
                }
                const updatedNode = message.data.node
                if (updatedNode.nodes)
                    setNodes(JSON.parse(updatedNode.nodes))
                if (updatedNode.edges)
                    setEdges(JSON.parse(updatedNode.edges))
            } else if (message.data.type == 'moved') {
                const updatedNode = JSON.parse(message.data.node)
                nodes.map(originalNode => {
                    if (originalNode.data.id == updatedNode.data.id && originalNode.position.x != updatedNode.position.x && originalNode.position.y != updatedNode.position.y) {
                        updateNodeData(updatedNode.data.id, updatedNode.data.title, updatedNode.position.x, updatedNode.position.y)
                    }
                });


            }
        }
    });

    useEffect(() => {
        if (edges && edges.length != 0 && JSON.stringify(edges) != curEdges) {
            channel.publish("channel-plan-it-" + boardInfo, { type: 'update-edge', node: JSON.stringify(edges) });

        }
    }, [edges])


    useEffect(() => {
        if (text && text != '') {
            channel.publish("channel-plan-it-" + boardInfo, { type: 'node-title-change', node: text });
        }
    }, [text]);
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    }
    const activeClasses = 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500';

    const inactiveClasses = 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300';
    const { space } = useSpace();

    useEffect(() => {
        const content = JSON.parse(boardContent);

        space?.enter({ name: userInfo, memberColor: content.memberColor });
    }, [space]);


    useEffect(() => {
        handleTabClick('edit')
    }, [])

    useEffect(() => {

        async function fetchData() {
            const response = await axios.post(import.meta.env.VITE_PLANIT_API_URL + '/space/join', {
                userFullname: userInfo,
                shortCode: boardInfo
            });

            if (response.status == 200) {
                setBoardContent(JSON.stringify(response.data.response.data));
                const content = JSON.parse(boardContent);
                if (content.nodes) {
                    setNodes(content.nodes);
                }
                if (content.edges) {
                    setEdges(content.edges);
                }

                if (content.owner != userInfo) {
                    channel.publish("channel-plan-it-" + boardInfo, { type: 'load-latest' });
                }
            }
        }
        fetchData();
    }, [])

    const nodeTypes = useMemo(() => ({ taskCard: TaskCard }), []);

    const reactFlowInstance = useReactFlow();
    const addTask = useCallback(() => {

        let nextNodeId = nodes.reduce((maxId, node) => {
            return node.data.id > maxId ? node.data.id : maxId;
        }, 0);
        const id = `${++nextNodeId}`;
        const dates = getDates();
        const newNode = {
            id,
            position: {
                x: Math.random() * 1000,
                y: Math.random() * 200,
            },
            type: 'taskCard',
            data: {
                id: id,
                type: 'Task',
                title: "Sample Task",
                resource: 'Unknown',
                startDate: dates.today,
                endDate: dates.today
            },
        };
        channel.publish("channel-plan-it-" + boardInfo, { type: 'new-node', node: JSON.stringify(newNode) });
        reactFlowInstance.addNodes(newNode);
    }, [nodes]);

    const addAITask = async () => {
        try {
            const postJson = JSON.stringify(nodes)
            const inputData = `
            Input Json: ${postJson}
            ${inputValue}
            `
            setIsAiLoading(true);
            setInputValue('');
            const response = await axios.post(import.meta.env.VITE_PLANIT_API_URL + "/ai/generate-task", {
                taskDescription: inputData
            });
            if (response.status == 200) {
                const data = response.data.response.data[0];
                if (data.finish_reason == 'stop') {
                } else if (data.finish_reason == 'function_call') {
                    const activity = JSON.parse(data.message.function_call.arguments);
                    if (activity.action == 'add-node') {
                        addNode(activity.title, activity.startDate, activity.endDate)
                    } else if (activity.action == 'delete-node') {
                        removeNodeAction(activity)
                    } else if (activity.action == 'update-node') {
                        updateNodeAction(activity)
                    }
                }
            }
        } catch (error) {
            setFailureMsg('Something went wrong')
        }
        setIsAiLoading(false);

    };

    const updateNodeAction = (activity: any) => {
        updateNodeInfo(activity.id, activity.title, activity.startDate, activity.endDate)
        channel.publish("channel-plan-it-" + boardInfo, { type: 'node-title-change', node: JSON.stringify({ id: activity.id, editedTitle: activity.title, startDate: activity.startDate, enDate: activity.endDate }) });
    }

    const removeNodeAction = (activity: any) => {
        removeNode(activity.id)
        channel.publish("channel-plan-it-" + boardInfo, { type: 'remove-node', node: JSON.stringify({ id: activity.id }) });
    }


    const getDates = () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            today: formatDate(today),
            tomorrow: formatDate(tomorrow)
        };
    };


    const addNode = (title: string, startDate: string, endDate: string) => {
        let nextNodeId = nodes.reduce((maxId, node) => {
            return node.data.id > maxId ? node.data.id : maxId;
        }, 0);
        const id = `${++nextNodeId}`;

        const dates = getDates();
        const newNode = {
            id,
            position: {
                x: Math.random() * 100,
                y: Math.random() * 100,
            },
            type: 'taskCard',
            data: {
                id: id,
                type: 'Task',
                title,
                resource: 'Unknown',
                startDate: !startDate || startDate == '' ? dates.today : startDate,
                endDate: !endDate || endDate == '' ? dates.today : endDate
            },
        };
        channel.publish("channel-plan-it-" + boardInfo, { type: 'new-node', node: JSON.stringify(newNode) });
        reactFlowInstance.addNodes(newNode);

    }

    const handleSave = useCallback(async () => {

        const content = JSON.parse(boardContent);
        // if(content.owner != userInfo){
        //     alert("Changes can only be saved (to cloud) by the creator of this plan")
        //     return
        // }
        content.nodes = nodes
        content.edges = edges
        const response = await axios.post(import.meta.env.VITE_PLANIT_API_URL + '/space/save', {
            owner: content.owner,
            userFullname: userInfo,
            space: content.space,
            nodes: content.nodes,
            edges: content.edges
        });

        if (response.status == 200) {
            setBoardContent(JSON.stringify({
                owner: content.owner,
                userFullname: userInfo,
                space: content.space,
                nodes: content.nodes,
                edges: content.edges
            }))
        }else{
            showFailureMessage('Board saving failed')

        }
        showSuccessMessage('Board saved')
    }, [nodes, edges, boardContent]);

    const doBeDeveloped = useCallback(() => {
        showSuccessMessage('This feature is coming soon')
    }, [nodes, edges]);

    const defaultViewport = { x: 0, y: 0, zoom: 1 };

    const [inputValue, setInputValue] = useState(''); // Initialize state with an empty string
    const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setInputValue(event.target.value); // Update state with the value of the input field
    };

    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            addAITask()
        }
    };

    const onNodesChange1 = (changes: any[]) => {
        if (changes.length != 0 && changes[0].type == 'position' && changes[0].dragging == false) {
            const changedNode = nodes.find(node => node.id == changes[0].id);

            channel.publish("channel-plan-it-" + boardInfo, { type: 'moved', node: JSON.stringify(changedNode) });

        }
        onNodesChange(changes)
    }

    const onEdgesChange1 = (changes: EdgeChange[]) => {
        onEdgesChange(changes)
    }


    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
        if (nodes && nodes.length != 0) {
            showFailureMessage('File import is only allowed on an empty board')
            return;
        }

        fileInputRef?.current?.click();
    };

    const handleFileSelect = (e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const contents = event?.target?.result;
            try {
                if (contents && typeof contents === 'string') {
                    const jsonData = JSON.parse(contents);
                    if (jsonData.nodes) {
                        setNodes(jsonData.nodes)
                        if (jsonData.edges) {
                            setEdges(jsonData.edges)
                        } else {
                            setEdges([])
                        }
                        channel.publish("channel-plan-it-" + boardInfo, { type: 'imported', node: JSON.stringify(jsonData) });
                    }
                    showSuccessMessage('File imported')
                } else {
                    showFailureMessage('File import failed')

                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                showFailureMessage('File import failed')
            }
        };

        reader.readAsText(file);
    };




    return (
        <>
            <NavBar />
            {/* <Link to="page1">Page 1</Link>
            <Link to="page2">Page 2</Link>
            <Outlet />
 */}
 {successMsg!=''?(
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                        <div className="p-1">
                            <p className="text-m">{successMsg}</p>
                        </div>
                    </div>
                </div>
            </div>):''}

            {failureMsg!=''?(
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-teal-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                        <div className="p-1">
                            <p className="text-m">{failureMsg}</p>
                        </div>
                    </div>
                </div>
            </div>):''}
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <div style={{ position: "absolute", right: '100px' }}>
                    <AvatarStack />
                </div>
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-tab" data-tabs-toggle="#default-tab-content" role="tablist">
                    <li className="mr-2" role="presentation">
                        <button className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-blue-600 hover:border-blue-600 dark:hover:text-gray-300 ${activeTab === 'edit' ? activeClasses : inactiveClasses
                            }`} id="profile-tab" data-tabs-target="#edit" type="button" role="tab" aria-controls="edit" aria-selected={activeTab === 'edit'}
                            onClick={() => handleTabClick('edit')}>Edit Mode </button>

                    </li>
                    <li className="mr-2" role="presentation">
                        <button className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-blue-600 hover:border-blue-600  dark:hover:text-gray-300 ${activeTab === 'gantt' ? activeClasses : inactiveClasses
                            }`} id="dashboard-tab" data-tabs-target="#gantt" type="button" role="tab" aria-controls="gantt" aria-selected={activeTab === 'gantt'}
                            onClick={() => handleTabClick('gantt')}>Gantt View</button>
                    </li>
                </ul>
            </div>


            <div id="default-tab-content" className="w-full">

                <div className={`w-full pt-4 rounded-lg dark:bg-gray-800 overflow-hidden ${activeTab === 'edit' ? '' : 'hidden'}`} >
                    <div className="mb-2 w-full">

                        <div className="flex items-center justify-between w-full">

                            <div className="">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept=".planit" // Specify your custom extension here
                                    onChange={handleFileSelect}
                                />
                                <Button.Group outline>
                                    <Button color="gray" onClick={handleButtonClick}><HiUpload className="mr-3 h-4 w-4" />  Import</Button>
                                    <Button color="gray" onClick={exportData}><HiDownload className="mr-3 h-4 w-4" />  Export</Button>
                                    <Button color="gray" onClick={handleSave}><HiSave className="mr-3 h-4 w-4" />  Save</Button>
                                    <Button color="gray" onClick={doBeDeveloped}><HiPlus className="mr-3 h-4 w-4" /> Milestones</Button>
                                    <Button color="gray" onClick={doBeDeveloped}><HiPlus className="mr-3 h-4 w-4" />  Resources</Button>
                                    <Button color="gray" onClick={addTask}><HiPlus className="mr-3 h-4 w-4" />  Task</Button>
                                </Button.Group>
                            </div>
                            <div className="w-5/6">
                                <div className="px-4 mb-2 sm:mb-0 flex justify-end">
                                    <div className="relative flex">
                                        <span className="absolute inset-y-0 flex items-center">
                                            <button onClick={doBeDeveloped} type="button" className="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                                </svg>
                                            </button>
                                        </span>

                                    </div>
                                    <input type="text" value={inputValue}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Describe your task, and dates to Plan.it AI!" className="w-5/6 focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3" />
                                    <div className="inset-y-0 hidden sm:flex ml-2">

                                        <Button color="blue" className="w-full" onClick={addAITask} isProcessing={isAiLoading}>
                                            Send
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="mt-6 w-full">
                        <div className="flex items-center justify-center">
                            <div className="border-t border-gray-300 w-1/3"></div>
                            <div className="px-2 font-semibold">Work Board</div>
                            <div className="border-t border-gray-300 w-1/3"></div>
                        </div>
                    </div>
                    <LiveCursors>
                        <ReactFlow
                            nodeTypes={nodeTypes}
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange1}
                            onEdgesChange={onEdgesChange1}
                            onEdgeUpdate={onEdgeUpdate}
                            onEdgeUpdateStart={onEdgeUpdateStart}
                            onEdgeUpdateEnd={onEdgeUpdateEnd}
                            onConnect={onConnect}
                            snapToGrid

                            defaultViewport={defaultViewport}

                        >
                            <Background id="1" gap={10} color="#f1f1f1" variant={BackgroundVariant.Lines} />
                            <Background id="2" gap={100} offset={1} color="#ccc" variant={BackgroundVariant.Lines} />

                        </ReactFlow>
                    </LiveCursors>
                </div>
                <div className={`w-full rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === 'gantt' ? '' : 'hidden'}`}>
                    <CustomGantt removeNodeAction={removeNodeAction} updateNodeAction={updateNodeAction} />
                </div>
            </div>



        </>
    )
}

export default Planner

