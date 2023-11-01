
import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';



// { id: '1', position: { x: 0, y: 0 }, data: { label: '1',color:'white' } },
// { id: '2', position: { x: 0, y: 100 }, data: { label: '2',color:'white' } },
// { id: '3', type: 'taskCard', position: { x: 0, y: 100 }, data: { label: '3',color:'white' } },
// { id: '4', type: 'taskCard', position: { x: 0, y: 100 }, data: { label: '4',color:'white' } },
//{ id: 'e1-2', source: '1', target: '2' }

// type NodeFormat ={
//     id:number,
//     position: {
//         x: number,
//         y: number,
//     },
//     type: string,
//     data: {
//         id: number,
//         type: string, 
//         title: string, 
//         resource: string,
//         startDate: string,
//         endDate: string
//     },
// }

// type EdgeFormat={
//     id:string,
//     source:string,
//     target:string    
// }

const initialNodes:Array<Node> = [];
const initialEdges:Array<Edge> = [];



type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeTitle:(nodeId: string, title: string) => void;
  updateNodeData:(nodeId: string, title: string,positionX:number,positionY:number) => void;
  removeEdge: (edgeId:any) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  updateNodeTitle: (nodeId: string, title: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
            console.log("dsdsd");
          // it's important to create a new object here, to inform React Flow about the cahnges
          node.data = { ...node.data, title };
        }

        return node;
      }),
    });
  },
  updateNodeData: (nodeId: string, title: string,positionX:number,positionY:number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new object here, to inform React Flow about the cahnges
          node.position.x=positionX
          node.position.y=positionY
          node.data = { ...node.data, title };
        }
        return node;
      }),
    });
  },
  removeEdge: (edgeId:any) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }));
  },
}));

export default useStore;
