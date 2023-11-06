import { useLocations, useMembers } from '@ably/spaces/dist/mjs/react';
import { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Member, getMemberProperty } from '../../utils/helpers';
import classNames from "classnames";
import styles from "../spreadsheet/Cell.module.css";
import useStore from '../../state/taskStore';
import { useRecoilState } from 'recoil';
import taskListAtom from '../../state/taskList';

const TaskCard = ({ data }: { data: any }) => {

    const { self, others } = useMembers()
    const updateNodeTitle = useStore((state) => state.updateNodeTitle);
    const [, setText] = useRecoilState(taskListAtom);
    const [editing, setEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(data.title);

    const handleTitleClick = () => {
        setEditing(true);
    };
    const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(evt.target.value);
    };

    const handleTitleBlur = () => {
        updateNodeTitle(data.id, editedTitle)
        setText(JSON.stringify({ id: data.id, editedTitle: editedTitle }))
        setEditing(false);

    };

    const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (evt.key === 'Enter') {
            handleTitleBlur();
        }
    };

    const selfInCell = (self as Member)?.location?.row === data.id;

    const cellMembers = others.filter((user: any) => {
        return (
            user.location?.row === data.id
        );
    });

    const labelColor = selfInCell
        ? self?.profileData?.memberColor
        : getMemberProperty(cellMembers as Member[], "memberColor");
    const { update } = useLocations();
    const updateSelection = useCallback((id: number) => {
        const location: Member["location"] = {
            row: id,
            col: 1
        };
        if (update) {
            update(location);
        }
    }, [update]);

    return (
        <>
            <Handle type="target" position={Position.Top} />

            <div onClick={() => updateSelection(data.id)}
                style={
                    {
                        "--info-bg-color": labelColor,
                        "--member-color": self?.profileData?.memberColor,
                        "--cell-member-color": cellMembers[0]?.profileData?.memberColor,
                        backgroundColor: selfInCell ? "white" : "#EDF1F6",
                    } as React.CSSProperties

                }

                className={`shadow-lg rounded-xl w-96 p-4 bg-white relative overflow-hidden ${classNames({
                    [styles.cellMembers]: cellMembers.length > 0 && !selfInCell,
                    [styles.rest]: !selfInCell && cellMembers.length === 0,
                    [styles.cellSelf]: selfInCell,
                })}`}
            >
                <div className="flex items-center border-b-2 mb-2 py-2">
                    <div className="flex items-center mb-4">
                        {/* Owner Initial */}
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {/* {generateInitials(data.resource)} */}
                            {data.id}
                        </div>
                        {/* Task Name */}
                        {editing ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        ) : (
                            <div className="ml-4 text-sm font-normal" onClick={handleTitleClick}>{data.title}</div>
                        )}
                    </div>

                </div>
                <div className="w-full">
                    <div className="w-full flex justify-between">
                        <div className="text-blue-600 text-xs font-medium mb-2">{data.startDate}</div>
                        <div className="text-blue-600 text-xs font-medium mb-2"> - </div>
                        <div className="text-blue-600 text-xs font-medium mb-2">{data.endDate}</div>
                    </div>
                    {/* <p className="text-gray-400 text-sm mb-4">
                            You’ve been coding for a while now and know your way around...
                        </p> */}
                </div>
                {/* <div className="w-full h-2 bg-blue-200 rounded-full">
                        <div className="w-1 h-full text-center text-xs text-white bg-blue-600 rounded-full">
                        </div>
                    </div> */}
            </div>




            <Handle type="source" position={Position.Bottom} id="a" />
        </>
    );
};

export default TaskCard;