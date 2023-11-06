import { atom } from "recoil";

const taskListAtom = atom({
    key: "taskListState",
    default: ''
});



export default taskListAtom;