import { useMemo, useRef, useEffect, ReactNode } from "react";
import { useMembers, useSpace } from "@ably/spaces/react";
import { Member, colours } from "../../utils/helpers";
import { MemberCursors, YourCursor } from "./Cursors";


import styles from "./LiveCursors.module.css";
import { useRecoilState } from "recoil";
import userInfoAtom from "../../state/userInfo";

interface LiveCursorsProps {
  children: ReactNode; // Define children prop
}

const LiveCursors: React.FC<LiveCursorsProps> = ({children}) => {
  const [userInfo, _] = useRecoilState(userInfoAtom);

  /** 💡 Select a color to assign randomly to a new user that enters the space💡 */
  const userColors = useMemo(
    () => colours[Math.floor(Math.random() * colours.length)],
    [],
  );

  /** 💡 Get a handle on a space instance 💡 */
  const { space } = useSpace();

  useEffect(() => {
    space?.enter({ userInfo, userColors });
  }, [space]);

  const { self } = useMembers();

  const liveCursors = useRef(null);

  return (
    <div
      id="live-cursors"
      ref={liveCursors}
      className={`example-container ${styles.liveCursorsContainer}`}
    >
      <YourCursor self={self as Member | null} parentRef={liveCursors} />
      <MemberCursors />
      {children}
    </div>
  );
};

export default LiveCursors;
