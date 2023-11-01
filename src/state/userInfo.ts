import { atom } from "recoil";
import { AtomEffect } from 'recoil';

const store = typeof window !== 'undefined' ? window.localStorage : null;

export const localStorageEffect: (key: string) => AtomEffect<any> =
    (key) =>
        ({ setSelf, onSet }) => {
            if (store) {
                const savedValue = store.getItem(key);
                if (savedValue != null) {
                    setSelf(savedValue);
                }
                onSet((newValue, _, isReset) => {
                    isReset ? store.removeItem(key) : store.setItem(key, newValue);
                });
            }
        };

const userInfoAtom = atom({
    key: "userInfoState",
    default: "",
    effects: [
        localStorageEffect('user'),
    ]
});



export default userInfoAtom;