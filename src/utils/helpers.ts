import { type SpaceMember } from "@ably/spaces";
//import { generate } from "random-words";

export const REMOVE_USER_AFTER_MILLIS = 120_000;
export const MAX_USERS_BEFORE_LIST = 4;
export const HORIZONTAL_SPACING_OFFSET = 40;
export const OVERLAP_AMOUNT = 40;
export const AVATAR_WIDTH = 48;

export type MemberProperty = "memberColor" | "name";
export type UpdateLocationCallback = (location: Member["location"]) => void;

export const getMemberProperty = (
  cellMembers: Member[],
  property: MemberProperty,
): string | null => {
  if (cellMembers.length > 0 && property in cellMembers[0].profileData) {
    return cellMembers[0].profileData[property];
  }
  return null;
};

export type Member = Omit<SpaceMember, "profileData"| "location"> & {
  profileData: {
    memberColor: string; name: string, userColors: {
      cursorColor: string;
    };
  };
  location: {
    row?: number;
    col?: number;
  };
};

// export const getSpaceNameFromUrl = () => {
//   const url = new URL(window.location.href);
//   const spaceNameInParams = url.searchParams.get("space");

//   if (spaceNameInParams) {
//     return spaceNameInParams;
//   } else {
//     const generatedName = generate({ exactly: 3, join: "-" });
//     url.searchParams.set("space", generatedName);
//     window.history.replaceState({}, "", `?${url.searchParams.toString()}`);
//     return generatedName;
//   }
// };

export const colours = [
  { cursorColor: "#FE372B" },
  { cursorColor: "#9C007E" },
  { cursorColor: "#008E06" },
  { cursorColor: "#460894" },
  { cursorColor: "#0284CD" },
  { cursorColor: "#AC8600" },
  { cursorColor: "#FF723F" },
  { cursorColor: "#FF17D2" },
  { cursorColor: "#00E80B" },
  { cursorColor: "#7A1BF2" },
  { cursorColor: "#2CC0FF" },
  { cursorColor: "#FFC700" },
];

export function calculateRightOffset({
  usersCount,
  index = 0,
}: {
  usersCount: number;
  index: number;
}): number {
  return usersCount > MAX_USERS_BEFORE_LIST
    ? (index + 1) * HORIZONTAL_SPACING_OFFSET
    : index * HORIZONTAL_SPACING_OFFSET;
}

export function calculateTotalWidth({ users }: { users: Member[] }): number {
  return (
    AVATAR_WIDTH +
    OVERLAP_AMOUNT * Math.min(users.length, MAX_USERS_BEFORE_LIST + 1)
  );
}


export const generateInitials=(name:string) =>{
  const words = name.split(' ');

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  } else {
    return (words[0].slice(0, 1) + words[1].slice(0, 1)).toUpperCase();
  }
}