
import NavBar from "../components/NavBar";
import { SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AvatarStack from "../components/avatars/AvatarStack";
import LiveCursors from "../components/cursor/LiveCursors";
// import { useRecoilState } from "recoil";
// import userInfoAtom from "../state/userInfo";
// import { getLocationColors } from "../utils/mockColors";
import { useSpace } from "@ably/spaces/dist/mjs/react";
import { useRecoilState } from "recoil";
import userInfoAtom from "../state/userInfo";
import { getLocationColors } from "../utils/mockColors";
import { Button } from "flowbite-react";
import taskListAtom from "../state/taskList";
import 'react-data-grid/lib/styles.css';
import ReactFlow, { Background, BackgroundVariant, EdgeChange, Node, useReactFlow, updateEdge } from "reactflow";
import 'reactflow/dist/style.css';
import TaskCard from "../components/flow/TaskCard";
import useStore from "../state/taskStore";
import { useChannel } from "ably/react";
import { Gantt, Task } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { HiPlus, HiSave, HiDownload, HiUpload } from 'react-icons/hi';

// const selector = (state: { nodes: any; edges: any; onNodesChange: any; onEdgesChange: any; onConnect: any; }) => ({
//     nodes: state.nodes,
//     edges: state.edges,
//     onNodesChange: state.onNodesChange,
//     onEdgesChange: state.onEdgesChange,
//     onConnect: state.onConnect,
// });

let tasks: Task[] = [
    {
      start: new Date(2020, 1, 1),
      end: new Date(2020, 1, 2),
      name: 'Thinking',
      id: 'Task 0',
      type:'task',
      progress: 45,
      isDisabled: true,
      styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
    }
];

function Planner() {
    const [activeTab, setActiveTab] = useState("edit");
    const [userInfo, ] = useRecoilState(userInfoAtom);
    const [text, ] = useRecoilState(taskListAtom);
    const [ganttData,setGanttData]=useState(tasks);

    const memberColor = useMemo(getLocationColors, []);
    const updateNodeTitle = useStore((state) => state.updateNodeTitle);
    const removeEdge = useStore((state) => state.removeEdge);

    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore();


    const updateNodeData = useStore((state) => state.updateNodeData);

    const edgeUpdateSuccessful = useRef(true);

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge: any, newConnection: any) => {
        edgeUpdateSuccessful.current = true;
        updateEdge(oldEdge, newConnection, edges);
    }, []);

    const onEdgeUpdateEnd = useCallback((_:any, edge: any) => {
        if (!edgeUpdateSuccessful.current) {
            //updateEdge(oldEdge, newConnection, edges);
            removeEdge(edge.id);
//            addEdge(edge,edges.filter((e) => e.id !== edge.id);
        }

        edgeUpdateSuccessful.current = true;
    }, []);
    // /** 💡 Get a handle on a space instance 💡 */
    // const { enter } = useSpace();

    //const { self, others } = useMembers();

   

    const { channel } = useChannel("plan-it", (message: any) => {

        console.log("messagedddd", message);
        if (message.name == 'plan-it') {
            if (message.data.type == 'new-node') {
                const nodeContent = JSON.parse(message.data.node)
                const isExisting = nodes.find((node: Node) => node.id === nodeContent.id);
                if(!isExisting)
                reactFlowInstance.addNodes(nodeContent);

            } else if (message.data.type == 'node-title-change') {
                const nodeContent = JSON.parse(message.data.node)
                console.log("received",nodeContent)
                updateNodeTitle(nodeContent.id, nodeContent.editedTitle)
            } else if (message.data.type == 'sync') {
                const updatedNodes = JSON.parse(message.data.node)

                nodes.map(originalNode => {
                    const updatedNode: Node = updatedNodes.find((node: Node) => node.id === originalNode.id);

                    if (updatedNode) {
                        console.log("here");
                        // Update position
                        //originalNode.position = updatedNode.position;
                        updateNodeData(updatedNode.data.id, updatedNode.data.title, updatedNode.position.x, updatedNode.position.y)
                        // Update title
                        originalNode.data.title = updatedNode.data.title;

                    }
                });


            }else if (message.data.type == 'moved') {
                const updatedNode = JSON.parse(message.data.node)

                nodes.map(originalNode => {

                    if(originalNode.data.id==updatedNode.data.id && originalNode.position.x!=updatedNode.position.x && originalNode.position.y!=updatedNode.position.y){
                        updateNodeData(updatedNode.data.id, updatedNode.data.title, updatedNode.position.x, updatedNode.position.y)
                    }

                  //  const updatedNode: Node = updatedNodes.find((node: Node) => node.id === originalNode.id);

                    // if (updatedNode) {

                    //     console.log("here");
                    //     // Update position
                    //     //originalNode.position = updatedNode.position;
                    //     updateNodeData(updatedNode.data.id, updatedNode.data.title, updatedNode.position.x, updatedNode.position.y)
                    //     // Update title
                    //     originalNode.data.title = updatedNode.data.title;

                    // }
                });


            }
        }

        //updateMessages((prev) => [...prev, message]);
    });


    useEffect(()=>{

        if(text && text!=''){
            channel.publish("plan-it", { type: 'node-title-change', node: text });
        }
        console.log("received change here",text)
    },[text]);
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    }
    const activeClasses = 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500';

    const inactiveClasses = 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300';
    // useEffect(() => {
    //     enter?.({ userInfo, memberColor });
    //   }, [enter]);


    const { space } = useSpace();


    useEffect(() => {
        space?.enter({ userInfo, memberColor });
    }, [space]);


    useEffect(() => {
        handleTabClick('edit')
    }, [])

    const nodeTypes = useMemo(() => ({ taskCard: TaskCard }), []);

    // const initialNodes = [
    //     { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    //     { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    //     { id: '3', type: 'taskCard', position: { x: 0, y: 100 }, data: { label: '3' } },
    //     { id: '4', type: 'taskCard', position: { x: 0, y: 100 }, data: { label: '4' } },

    // ];
    // const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];



    // const syncData = () => {
    //     console.log("sending data")
    //     channel.publish("plan-it", { type: 'sync', node: JSON.stringify(nodes) });
    // }

    //setTimeout(syncData,10000)

    // const printNodes = () => {
    //     console.log('nodes', nodes)
    // }
    // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    let nodeId = 1;
    const reactFlowInstance = useReactFlow();
    const addTask = useCallback(() => {
        const id = `${++nodeId}`;
        const newNode = {
            id,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            type: 'taskCard',
            data: {
                id: id,
                type: 'Task',
                title: "Sample Task",
                resource: 'Unknown',
                startDate: '2023-11-01',
                endDate: '2023-11-01'
            },
        };
        channel.publish("plan-it", { type: 'new-node', node: JSON.stringify(newNode) });
        reactFlowInstance.addNodes(newNode);
    }, []);

    const addAITask = useCallback(() => {
        setInputValue('');
        setTimeout(function(){
        const id = `${++nodeId}`;
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
                title: "Build floor plan",
                resource: 'Unknown',
                startDate: '2023-11-01',
                endDate: '2023-11-07'
            },
        };
        channel.publish("plan-it", { type: 'new-node', node: JSON.stringify(newNode) });
        reactFlowInstance.addNodes(newNode);
    },2000);
    }, []);

    const doBeDeveloped = useCallback(() => {
        alert("Coming soon")
    }, []);

    // const [zoomLevel, setZoomLevel] = useState(1);

    // const handleZoomChange = (newZoomLevel: number) => {
    //     setZoomLevel(newZoomLevel);
    // };
    const defaultViewport = { x: 0, y: 0, zoom: 1 };

    const [inputValue, setInputValue] = useState(''); // Initialize state with an empty string
    const handleChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setInputValue(event.target.value); // Update state with the value of the input field
    };

    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            console.log('inputValue', inputValue)
            
            addAITask()
            
        }
    };


    const onNodesChange1 = (changes: any[]) => {
        if(changes.length!=0 && changes[0].type=='position' && changes[0].dragging==false){
            const changedNode = nodes.find(node => node.id == changes[0].id);

            channel.publish("plan-it", { type: 'moved', node: JSON.stringify(changedNode) });

//            console.log('node change', changes)
        }
        console.log('node change', changes)
        onNodesChange(changes)
    }

    const onEdgesChange1 = (changes: EdgeChange[]) => {
        console.log('edge change', changes)

        onEdgesChange(changes)
    }
    const convertNodes=(nodes1:any)=> {
        return nodes1.map((node:any) => ({
          start: new Date(node.data.startDate),
          end: new Date(node.data.endDate),
          name: node.data.title,
          id: `Task ${node.id}`,
          type: 'task',
          progress: 1,
          //isDisabled: true,
        }));
      }

    useEffect(()=>{
        if(nodes.length!=0){
            //console.log('nodes=',nodes)
            //console.log('convertNodes(nodes)',convertNodes(nodes))
        setGanttData(convertNodes(nodes))
        }
    },[nodes,text])

    return (
        <>
            <NavBar />
            {/* <Link to="page1">Page 1</Link>
            <Link to="page2">Page 2</Link>
            <Outlet />
 */}


            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <div style={{ position: "absolute", right: '0' }}>
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

                <div style={{ width: '100vw', height: '80vh' }} className={`w-full p-4 rounded-lg dark:bg-gray-800 overflow-hidden ${activeTab === 'edit' ? '' : 'hidden'}`} >
                    <div className="mb-2 w-full">

                        <div className="flex items-center justify-between w-full">

                            <div className="">
                                <Button.Group outline>
                                    <Button color="gray" onClick={doBeDeveloped}><HiUpload className="mr-3 h-4 w-4" />  Import</Button>
                                    <Button color="gray" onClick={doBeDeveloped}><HiDownload className="mr-3 h-4 w-4" />  Export</Button>
                                    <Button color="gray" onClick={doBeDeveloped}><HiSave className="mr-3 h-4 w-4" />  Save</Button>
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
                                        <button onClick={addAITask} type="button" className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none">
                                            <span className="font-bold">Send</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 ml-2 transform rotate-90">
                                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                            </svg>
                                        </button>
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
                            defaultViewport={defaultViewport}

                        >
                            <Background id="1" gap={10} color="#f1f1f1" variant={BackgroundVariant.Lines} />
                            <Background id="2" gap={100} offset={1} color="#ccc" variant={BackgroundVariant.Lines} />

                        </ReactFlow>
                    </LiveCursors>
                </div>
                <div className={`w-full rounded-lg bg-gray-50 dark:bg-gray-800 ${activeTab === 'gantt' ? '' : 'hidden'}`}>
                <Gantt tasks={ganttData} />
                </div>
            </div>



        </>
    )
}

export default Planner

